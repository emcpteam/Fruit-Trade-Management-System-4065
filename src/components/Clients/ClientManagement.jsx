import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useOrderStore from '@/store/orderStore';
import WarehouseManager from './WarehouseManager';
import ClientImageManager from './ClientImageManager';
import ContactManager from './ContactManager';

const { FiPlus, FiEdit, FiTrash, FiMapPin, FiUser, FiPhone, FiMail, FiImage, FiMap } = FiIcons;

const ClientManagement = () => {
  const { clients, addClient, updateClient, deleteClient } = useOrderStore();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showWarehouseManager, setShowWarehouseManager] = useState(null);
  const [showImageManager, setShowImageManager] = useState(null);
  const [showContactManager, setShowContactManager] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const clientData = {
        ...data,
        warehouses: data.warehouses || [],
        images: data.images || [],
        notes: data.notes || [],
        contacts: data.contacts || [],
        addresses: data.addresses || [],
        bankAccounts: data.bankAccounts || []
      };

      if (editingClient) {
        updateClient(editingClient.id, clientData);
        toast.success('Cliente aggiornato con successo!');
      } else {
        addClient(clientData);
        toast.success('Cliente aggiunto con successo!');
      }

      reset();
      setShowForm(false);
      setEditingClient(null);
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setValue('name', client.name);
    setValue('address', client.address);
    setValue('city', client.city);
    setValue('vatNumber', client.vatNumber);
    setValue('sdi', client.sdi);
    setValue('phone', client.phone);
    setValue('email', client.email);
    setShowForm(true);
  };

  const handleDelete = (clientId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo cliente?')) {
      deleteClient(clientId);
      toast.success('Cliente eliminato');
    }
  };

  const handleWarehouseUpdate = (clientId, warehouses) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      updateClient(clientId, { ...client, warehouses });
      toast.success('Magazzini aggiornati');
    }
  };

  const handleImageUpdate = (clientId, images, notes) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      updateClient(clientId, { ...client, images, notes });
      toast.success('Immagini e note aggiornate');
    }
  };

  const handleContactUpdate = (clientId, updatedData) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      updateClient(clientId, updatedData);
      toast.success('Contatti e indirizzi aggiornati');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-nordic-800">Gestione Clienti</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="bg-sage-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sage-700 transition-colors duration-200 flex items-center gap-2"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          Nuovo Cliente
        </motion.button>
      </div>

      {/* Client Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-nordic-800">
                {editingClient ? 'Modifica Cliente' : 'Nuovo Cliente'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingClient(null);
                  reset();
                }}
                className="text-nordic-400 hover:text-nordic-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Ragione Sociale *
                  </label>
                  <input
                    {...register('name', { required: 'Ragione sociale obbligatoria' })}
                    type="text"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="Nome dell'azienda"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Partita IVA *
                  </label>
                  <input
                    {...register('vatNumber', { required: 'Partita IVA obbligatoria' })}
                    type="text"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="IT12345678901"
                  />
                  {errors.vatNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.vatNumber.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Indirizzo Sede Legale *
                  </label>
                  <input
                    {...register('address', { required: 'Indirizzo obbligatorio' })}
                    type="text"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="Via, numero civico"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Città *
                  </label>
                  <input
                    {...register('city', { required: 'Città obbligatoria' })}
                    type="text"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="CAP Città Provincia"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Codice SDI
                  </label>
                  <input
                    {...register('sdi')}
                    type="text"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="Codice destinatario fatturazione"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Telefono
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="+39 123 456 7890"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Email
                  </label>
                  <input
                    {...register('email', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email non valida'
                      }
                    })}
                    type="email"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="cliente@esempio.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingClient(null);
                    reset();
                  }}
                  className="px-4 py-2 text-nordic-600 border border-nordic-300 rounded-lg hover:bg-nordic-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                >
                  {editingClient ? 'Aggiorna' : 'Salva'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Warehouse Manager Modal */}
      {showWarehouseManager && (
        <WarehouseManager
          client={showWarehouseManager}
          onClose={() => setShowWarehouseManager(null)}
          onUpdate={handleWarehouseUpdate}
        />
      )}

      {/* Image Manager Modal */}
      {showImageManager && (
        <ClientImageManager
          client={showImageManager}
          onClose={() => setShowImageManager(null)}
          onUpdate={handleImageUpdate}
        />
      )}

      {/* Contact Manager Modal */}
      {showContactManager && (
        <ContactManager
          entity={showContactManager}
          type="client"
          onClose={() => setShowContactManager(null)}
          onUpdate={handleContactUpdate}
        />
      )}

      {/* Clients List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-nordic-200"
      >
        <div className="p-6 border-b border-nordic-200">
          <h2 className="text-lg font-semibold text-nordic-800">Lista Clienti</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-nordic-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Partita IVA</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Città</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Contatti</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Gestione</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nordic-200">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-nordic-500">
                    Nessun cliente presente
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-nordic-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                          <SafeIcon icon={FiUser} className="w-5 h-5 text-sage-600" />
                        </div>
                        <div>
                          <div className="font-medium text-nordic-800">{client.name}</div>
                          <div className="text-sm text-nordic-500">{client.address}</div>
                          {client.images && client.images.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                              <SafeIcon icon={FiImage} className="w-3 h-3" />
                              {client.images.length} immagini
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-nordic-800">{client.vatNumber}</td>
                    <td className="px-6 py-4 text-nordic-800">{client.city}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {client.phone && (
                          <div className="flex items-center gap-1 text-sm text-nordic-600">
                            <SafeIcon icon={FiPhone} className="w-3 h-3" />
                            {client.phone}
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-1 text-sm text-nordic-600">
                            <SafeIcon icon={FiMail} className="w-3 h-3" />
                            {client.email}
                          </div>
                        )}
                        {client.contacts && client.contacts.length > 0 && (
                          <div className="text-xs text-green-600">
                            +{client.contacts.length} contatti
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => setShowContactManager(client)}
                          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                        >
                          <SafeIcon icon={FiUser} className="w-3 h-3" />
                          Contatti ({client.contacts?.length || 0})
                        </button>
                        <button
                          onClick={() => setShowWarehouseManager(client)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <SafeIcon icon={FiMap} className="w-3 h-3" />
                          Magazzini ({client.warehouses?.length || 0})
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowImageManager(client)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Gestisci immagini e note"
                        >
                          <SafeIcon icon={FiImage} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-nordic-600 hover:bg-nordic-100 rounded-lg transition-colors"
                        >
                          <SafeIcon icon={FiEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <SafeIcon icon={FiTrash} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default ClientManagement;