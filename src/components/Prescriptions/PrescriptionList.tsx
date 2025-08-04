import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, FileText, User, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Prescription {
  id: number;
  prescription_number: string;
  customer_id: number;
  customer_name: string;
  doctor_name: string;
  diagnosis: string;
  status: string;
  prescription_date: string;
  expiry_date: string;
  is_digital: boolean;
  validation_status: string;
  notes: string;
}

interface PrescriptionItem {
  id: number;
  prescription_id: number;
  product_id: number;
  product_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  is_controlled: boolean;
}

interface ControlledMedication {
  id: number;
  prescription_id: number;
  product_id: number;
  product_name: string;
  quantity_dispensed: number;
  dispense_date: string;
  pharmacist_id: number;
  pharmacist_name: string;
  patient_signature: boolean;
}

export function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [controlledMedications, setControlledMedications] = useState<ControlledMedication[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  
  const [formData, setFormData] = useState({
    customer_id: '',
    doctor_name: '',
    diagnosis: '',
    prescription_date: '',
    expiry_date: '',
    is_digital: false,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load prescriptions with customer names
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          customers!inner(full_name)
        `)
        .order('prescription_date', { ascending: false });

      if (prescriptionsError) throw prescriptionsError;
      setPrescriptions(prescriptionsData?.map(prescription => ({
        ...prescription,
        customer_name: prescription.customers.full_name
      })) || []);

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
        .select('id, name, is_controlled')
        .order('name');

      if (productsError) throw productsError;
      setProducts(productsData || []);

    } catch (error: any) {
      toast.error('Error al cargar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPrescriptionItems = async (prescriptionId: number) => {
    try {
      const { data, error } = await supabase
        .from('prescription_items')
        .select(`
          *,
          products!inner(name, is_controlled)
        `)
        .eq('prescription_id', prescriptionId);

      if (error) throw error;
      setPrescriptionItems(data?.map(item => ({
        ...item,
        product_name: item.products.name,
        is_controlled: item.products.is_controlled
      })) || []);
    } catch (error: any) {
      toast.error('Error al cargar items: ' + error.message);
    }
  };

  const loadControlledMedications = async (prescriptionId: number) => {
    try {
      const { data, error } = await supabase
        .from('controlled_medications')
        .select(`
          *,
          products!inner(name),
          users!inner(full_name)
        `)
        .eq('prescription_id', prescriptionId);

      if (error) throw error;
      setControlledMedications(data?.map(med => ({
        ...med,
        product_name: med.products.name,
        pharmacist_name: med.users.full_name
      })) || []);
    } catch (error: any) {
      toast.error('Error al cargar medicamentos controlados: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prescriptionNumber = `RX-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([{
          ...formData,
          prescription_number: prescriptionNumber,
          status: 'active',
          validation_status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Receta creada exitosamente');
      setShowModal(false);
      setFormData({
        customer_id: '',
        doctor_name: '',
        diagnosis: '',
        prescription_date: '',
        expiry_date: '',
        is_digital: false,
        notes: ''
      });
      loadData();
    } catch (error: any) {
      toast.error('Error al crear receta: ' + error.message);
    }
  };

  const deletePrescription = async (id: number) => {
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

  const validatePrescription = async (id: number) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ validation_status: 'validated' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Receta validada exitosamente');
      loadData();
    } catch (error: any) {
      toast.error('Error al validar receta: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'expired': return 'Expirada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getValidationColor = (status: string) => {
    switch (status) {
      case 'validated': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getValidationText = (status: string) => {
    switch (status) {
      case 'validated': return 'Validada';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Recetas Médicas</h1>
          <p className="text-gray-600">Administra recetas digitales, validaciones y medicamentos controlados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nueva Receta
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'prescriptions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recetas
          </button>
          <button
            onClick={() => setActiveTab('controlled')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'controlled'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Medicamentos Controlados
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar recetas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions
            .filter(prescription => 
              prescription.prescription_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
              prescription.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              prescription.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((prescription) => (
              <div key={prescription.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{prescription.prescription_number}</h3>
                      {prescription.is_digital && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Digital
                        </span>
                      )}
                      {isExpired(prescription.expiry_date) && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Expirada
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">Paciente: {prescription.customer_name}</p>
                    <p className="text-gray-600">Dr. {prescription.doctor_name}</p>
                    <p className="text-sm text-gray-500 mt-2">{prescription.diagnosis}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(prescription.prescription_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Vence: {new Date(prescription.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(prescription.status)}`}>
                      {getStatusText(prescription.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${getValidationColor(prescription.validation_status)}`}>
                      {getValidationText(prescription.validation_status)}
                    </span>
                    <div className="flex gap-2">
                      {prescription.validation_status === 'pending' && (
                        <button
                          onClick={() => validatePrescription(prescription.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Validar receta"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          loadPrescriptionItems(prescription.id);
                          loadControlledMedications(prescription.id);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePrescription(prescription.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar receta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === 'controlled' && (
        <div className="space-y-4">
          {controlledMedications
            .filter(med => 
              med.product_name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((medication) => (
              <div key={medication.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{medication.product_name}</h3>
                    <p className="text-gray-600">Cantidad dispensada: {medication.quantity_dispensed}</p>
                    <p className="text-gray-600">Farmacéutico: {medication.pharmacist_name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(medication.dispense_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        {medication.patient_signature ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        )}
                        {medication.patient_signature ? 'Firmado' : 'Pendiente firma'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

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
                  Doctor
                </label>
                <input
                  type="text"
                  required
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico
                </label>
                <textarea
                  required
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Receta
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.prescription_date}
                    onChange={(e) => setFormData({...formData, prescription_date: e.target.value})}
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_digital"
                  checked={formData.is_digital}
                  onChange={(e) => setFormData({...formData, is_digital: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_digital" className="text-sm font-medium text-gray-700">
                  Receta Digital
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
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
                  onClick={() => setShowModal(false)}
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
      {showDetails && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalles de Receta - {selectedPrescription.prescription_number}</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Paciente</p>
                <p className="font-medium">{selectedPrescription.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Doctor</p>
                <p className="font-medium">Dr. {selectedPrescription.doctor_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(selectedPrescription.status)}`}>
                  {getStatusText(selectedPrescription.status)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Validación</p>
                <span className={`px-2 py-1 rounded-full text-sm ${getValidationColor(selectedPrescription.validation_status)}`}>
                  {getValidationText(selectedPrescription.validation_status)}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Diagnóstico</h3>
              <p className="text-gray-700">{selectedPrescription.diagnosis}</p>
            </div>

            {prescriptionItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay medicamentos en esta receta</p>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold">Medicamentos Prescritos</h3>
                {prescriptionItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">Dosis: {item.dosage}</p>
                        <p className="text-sm text-gray-600">Frecuencia: {item.frequency}</p>
                        <p className="text-sm text-gray-600">Duración: {item.duration}</p>
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                      </div>
                      {item.is_controlled && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Controlado
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {controlledMedications.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold">Historial de Dispensación (Medicamentos Controlados)</h3>
                {controlledMedications.map((medication) => (
                  <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{medication.product_name}</h4>
                        <p className="text-sm text-gray-600">Cantidad: {medication.quantity_dispensed}</p>
                        <p className="text-sm text-gray-600">Farmacéutico: {medication.pharmacist_name}</p>
                        <p className="text-sm text-gray-600">
                          Fecha: {new Date(medication.dispense_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {medication.patient_signature ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Firmado
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 