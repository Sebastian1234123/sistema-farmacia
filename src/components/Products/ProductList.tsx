import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, AlertTriangle, X, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    active_ingredient: '',
    laboratory: '',
    category: 'generic',
    price: '',
    stock_quantity: '',
    min_stock: '',
    description: '',
    requires_prescription: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Error al cargar productos');
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: newProduct.name,
        code: newProduct.code,
        active_ingredient: newProduct.active_ingredient,
        laboratory: newProduct.laboratory,
        category: newProduct.category,
        price: parseFloat(newProduct.price),
        stock_quantity: parseInt(newProduct.stock_quantity),
        min_stock: parseInt(newProduct.min_stock),
        description: newProduct.description,
        requires_prescription: newProduct.requires_prescription,
        is_active: true
      };

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;

      setProducts([...products, data]);
      setShowAddModal(false);
      resetForm();
      toast.success('Producto agregado correctamente');
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Error al agregar producto');
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      code: '',
      active_ingredient: '',
      laboratory: '',
      category: 'generic',
      price: '',
      stock_quantity: '',
      min_stock: '',
      description: '',
      requires_prescription: false
    });
  };

  const exportToExcel = (exportAll = false) => {
    try {
      const productsToExport = exportAll ? products : filteredProducts;
      
      if (productsToExport.length === 0) {
        toast.error('No hay productos para exportar');
        return;
      }

      // Preparar los datos para exportar
      const exportData = productsToExport.map(product => ({
        'Código': product.code,
        'Nombre': product.name,
        'Principio Activo': product.active_ingredient,
        'Laboratorio': product.laboratory,
        'Categoría': getCategoryLabel(product.category),
        'Precio (S/)': product.price.toFixed(2),
        'Stock Actual': product.stock_quantity,
        'Stock Mínimo': product.min_stock,
        'Estado Stock': getStockStatus(product).label,
        'Requiere Receta': product.requires_prescription ? 'Sí' : 'No',
        'Descripción': product.description || '',
        'Activo': product.is_active ? 'Sí' : 'No',
        'Fecha Creación': product.created_at ? new Date(product.created_at).toLocaleDateString('es-ES') : '',
        'Última Actualización': product.updated_at ? new Date(product.updated_at).toLocaleDateString('es-ES') : ''
      }));

      // Crear el workbook y worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Productos');

      // Configurar el ancho de las columnas
      const columnWidths = [
        { wch: 12 }, // Código
        { wch: 30 }, // Nombre
        { wch: 20 }, // Principio Activo
        { wch: 15 }, // Laboratorio
        { wch: 12 }, // Categoría
        { wch: 10 }, // Precio
        { wch: 12 }, // Stock Actual
        { wch: 12 }, // Stock Mínimo
        { wch: 12 }, // Estado Stock
        { wch: 12 }, // Requiere Receta
        { wch: 30 }, // Descripción
        { wch: 8 },  // Activo
        { wch: 12 }, // Fecha Creación
        { wch: 12 }  // Última Actualización
      ];
      ws['!cols'] = columnWidths;

      // Agregar información del reporte
      const reportInfo = [
        ['REPORTE DE PRODUCTOS - PHARMASYS'],
        [''],
        [`Fecha de exportación: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`],
        [`Total de productos: ${productsToExport.length}`],
        [`Productos con stock bajo: ${productsToExport.filter(p => p.stock_quantity <= p.min_stock).length}`],
        [`Productos sin stock: ${productsToExport.filter(p => p.stock_quantity === 0).length}`],
        [''],
        ['FILTROS APLICADOS:'],
        [`Categoría: ${selectedCategory === 'all' ? 'Todas' : getCategoryLabel(selectedCategory)}`],
        [`Búsqueda: ${searchTerm || 'Ninguna'}`],
        [''],
        ['DATOS DE PRODUCTOS:']
      ];

      // Insertar información del reporte al inicio
      XLSX.utils.sheet_add_aoa(ws, reportInfo, { origin: 'A1' });

      // Generar el archivo Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Descargar el archivo
      const fileName = `productos_${exportAll ? 'completo' : 'filtrado'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);
      
      toast.success(`Archivo Excel exportado correctamente (${productsToExport.length} productos)`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Error al exportar el archivo Excel');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.active_ingredient.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { label: 'Sin Stock', color: 'bg-red-100 text-red-800' };
    }
    if (product.stock_quantity <= product.min_stock) {
      return { label: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: 'Stock Normal', color: 'bg-green-100 text-green-800' };
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      generic: 'Genérico',
      brand: 'Marca',
      otc: 'Venta Libre',
      controlled: 'Controlado'
    };
    return labels[category as keyof typeof labels] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gestión de Productos</h3>
        <div className="flex items-center gap-3">
          <div className="relative export-menu-container">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={products.length === 0}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar Excel
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      exportToExcel(false);
                      setShowExportMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Exportar productos filtrados ({filteredProducts.length})
                  </button>
                  <button
                    onClick={() => {
                      exportToExcel(true);
                      setShowExportMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Exportar todos los productos ({products.length})
                  </button>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, código o principio activo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                <option value="generic">Genéricos</option>
                <option value="brand">Marca</option>
                <option value="otc">Venta Libre</option>
                <option value="controlled">Controlados</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.active_ingredient} - {product.laboratory}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getCategoryLabel(product.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">
                          {product.stock_quantity}
                        </span>
                        {product.stock_quantity <= product.min_stock && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 ml-2" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      S/ {product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Modal para agregar producto */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Agregar Nuevo Producto</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Paracetamol 500mg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.code}
                    onChange={(e) => setNewProduct({...newProduct, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: PAR001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Principio Activo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.active_ingredient}
                    onChange={(e) => setNewProduct({...newProduct, active_ingredient: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Paracetamol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Laboratorio *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.laboratory}
                    onChange={(e) => setNewProduct({...newProduct, laboratory: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Bayer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="generic">Genérico</option>
                    <option value="brand">Marca</option>
                    <option value="otc">Venta Libre</option>
                    <option value="controlled">Controlado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Inicial *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Mínimo *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProduct.min_stock}
                    onChange={(e) => setNewProduct({...newProduct, min_stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción del producto..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requires_prescription"
                  checked={newProduct.requires_prescription}
                  onChange={(e) => setNewProduct({...newProduct, requires_prescription: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requires_prescription" className="ml-2 block text-sm text-gray-900">
                  Requiere receta médica
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}