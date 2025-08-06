import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, FileText, Calendar, User, Pill, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Prescription {
  id: string;
  customer_id: string;
  doctor_name: string;
  prescription_number: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'fulfilled';
  notes?: string;
  created_at: string;
  customers?: { full_name: string };
}

interface PrescriptionItem {
  id: string;
  prescription_id: string;
  product_id: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  fulfilled_quantity: number;
  products?: { name: string };
}

export function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customer_id: '',
    doctor_name: '',
    prescription_number: '',
    issue_date: '',
    expiry_date: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load prescriptions
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          customers(full_name)
        `)
        .order('created_at', { ascending: false });

      if (prescriptionsError) throw prescriptionsError;
      setPrescriptions(prescriptionsData || []);

      // Load customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, full_name')
        .order('full_name');

      if (customersError) throw customersError;
      setCustomers(customersData || []);

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .eq('requires_prescription', true)
        .order('name');

      if (productsError) throw productsError;
      setProducts(productsData || []);

    } catch (error: any) {
      toast.error('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPrescriptionItems = async (prescriptionId: string) => {
    try {
      const { data, error } = await supabase
        .from('prescription_items')
        .select(`
          *,
          products(name)
        `)
        .eq('prescription_id', prescriptionId);

      if (error) throw error;
      setPrescriptionItems(data || []);
    } catch (error: any) {
      toast.error('Error al cargar items: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([{
          ...formData,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Receta creada exitosamente');
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error('Error al crear receta: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      doctor_name: '',
      prescription_number: '',
      issue_date: '',
      expiry_date: '',
      notes: ''
    });
  };

  const deletePrescription = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta receta?')) return;

    try {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Receta eliminada exitosamente');
      loadData();
    } catch (error: any) {
      toast.error('Error al eliminar receta: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'fulfilled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'expired': return 'Expirada';
      case 'fulfilled': return 'Completada';
      default: return status;
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.prescription_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prescription.customers?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Recetas Médicas</h1>
          <p className="text-gray-600">Administra recetas médicas y medicamentos controlados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nueva Receta
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por número de receta, doctor o paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Emisión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
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
              {filteredPrescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {prescription.prescription_number}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {prescription.customers?.full_name || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Dr. {prescription.doctor_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(prescription.issue_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">
                        {new Date(prescription.expiry_date).toLocaleDateString()}
                      </span>
                      {isExpiringSoon(prescription.expiry_date) && (
                        <AlertCircle className="w-4 h-4 text-yellow-500 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
                      {getStatusText(prescription.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          loadPrescriptionItems(prescription.id);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePrescription(prescription.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPrescriptions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron recetas</p>
          </div>
        )}
      </div>

      {/* Add Prescription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva Receta Médica</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paciente
                </label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar paciente</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Receta
                </label>
                <input
                  type="text"
                  required
                  value={formData.prescription_number}
                  onChange={(e) => setFormData({...formData, prescription_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="RX-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <input
                  type="text"
                  required
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Dr. Juan Pérez"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Emisión
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.issue_date}
                    onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Observaciones adicionales..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Crear Receta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Details Modal */}
      {showDetailsModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Detalles de Receta - {selectedPrescription.prescription_number}
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Paciente</p>
                <p className="font-medium">{selectedPrescription.customers?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Doctor</p>
                <p className="font-medium">Dr. {selectedPrescription.doctor_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de Emisión</p>
                <p className="font-medium">
                  {new Date(selectedPrescription.issue_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vencimiento</p>
                <p className="font-medium">
                  {new Date(selectedPrescription.expiry_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedPrescription.notes && (
              <div className="mb-6">
                <p className="text-sm text-gray-500">Notas</p>
                <p className="font-medium">{selectedPrescription.notes}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Medicamentos Prescritos</h3>
              {prescriptionItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay medicamentos registrados en esta receta
                </p>
              ) : (
                <div className="space-y-4">
                  {prescriptionItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium flex items-center">
                            <Pill className="w-4 h-4 mr-2 text-blue-500" />
                            {item.products?.name}
                          </h4>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Cantidad:</span> {item.quantity}
                            </div>
                            <div>
                              <span className="font-medium">Dosis:</span> {item.dosage}
                            </div>
                            <div>
                              <span className="font-medium">Frecuencia:</span> {item.frequency}
                            </div>
                            <div>
                              <span className="font-medium">Duración:</span> {item.duration}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Dispensado</p>
                          <p className="font-medium">
                            {item.fulfilled_quantity} / {item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}