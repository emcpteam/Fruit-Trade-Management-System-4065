import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit, FiTrash, FiMapPin, FiSave, FiX } = FiIcons;

const VendorWarehouseManager = ({ vendor, onClose, onUpdate }) => {
  const [warehouses, setWarehouses] = useState(vendor.warehouses || []);
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    const warehouseData = {
      ...data,
      id: editingWarehouse ? editingWarehouse.id : Date.now(),
      createdAt: editingWarehouse ? editingWarehouse.createdAt : new Date().toISOString()
    };

    if (editingWarehouse) {
      setWarehouses(prev => prev.map(w => w.id === editingWarehouse.id ? warehouseData : w));
      toast.success('Magazzino aggiornato');
    } else {
      setWarehouses(prev => [...prev, warehouseData]);
      toast.success('Magazzino aggiunto');
    }

    reset();
    setShowForm(false);
    setEditingWarehouse(null);
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setValue('name', warehouse.name);
    setValue('address', warehouse.address);
    setValue('city', warehouse.city);
    setValue('contactPerson', warehouse.contactPerson);
    setValue('phone', warehouse.phone);
    setValue('email', warehouse.email);
    setValue('notes', warehouse.notes);
    setValue('capacity', warehouse.capacity);
    setValue('productTypes', warehouse.productTypes);
    setShowForm(true);
  };

  const handleDelete = (warehouseId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo magazzino?')) {
      setWarehouses(prev => prev.filter(w => w.id !== warehouseId));
      toast.success('Magazzino eliminato');
    }
  };

  const handleSave = () => {
    onUpdate(vendor.id, warehouses);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-nordic-800">Gestione Magazzini Fornitore</h2>
            <p className="text-sm text-nordic-500">{vendor.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-nordic-400 hover:text-nordic-600"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-nordic-800">
            Magazzini Associati ({warehouses.length})
          </h3>
          <button
            onClick={() => setShowForm(true)}
            className="bg-sage-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sage-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Nuovo Magazzino
          </button>
        </div>

        {/* Warehouse Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-nordic-50 rounded-lg p-4 mb-6"
          >
            <h4 className="text-md font-medium text-nordic-800 mb-4">
              {editingWarehouse ? 'Modifica Magazzino' : 'Nuovo Magazzino'}
            </h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Nome Magazzino *
                  </label>
                  <input
                    {...register('name', { required: 'Nome magazzino obbligatorio' })}
                    type="text"
                    className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="es. Deposito Centrale"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Capacità (tonnellate)
                  </label>
                  <input
                    {...register('capacity')}
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="es. 500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Indirizzo *
                  </label>
                  <input
                    {...register('address', { required: 'Indirizzo obbligatorio' })}
                    type="text"
                    className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="CAP Città Provincia"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Responsabile Magazzino
                  </label>
                  <input
                    {...register('contactPerson')}
                    type="text"
                    className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="Nome responsabile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Telefono
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="magazzino@fornitore.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Tipologie Prodotti Stoccati
                  </label>
                  <input
                    {...register('productTypes')}
                    type="text"
                    className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="es. Cipolle, Patate, Carote, Prodotti biologici"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Note e Caratteristiche
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="Note sul magazzino, temperature di stoccaggio, certificazioni, etc..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingWarehouse(null);
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
                  {editingWarehouse ? 'Aggiorna' : 'Aggiungi'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Warehouses List */}
        <div className="space-y-4">
          {warehouses.length === 0 ? (
            <div className="text-center py-8 text-nordic-500">
              <SafeIcon icon={FiMapPin} className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nessun magazzino configurato</p>
              <p className="text-sm">Aggiungi il primo magazzino per iniziare</p>
            </div>
          ) : (
            warehouses.map((warehouse) => (
              <motion.div
                key={warehouse.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-nordic-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <SafeIcon icon={FiMapPin} className="w-5 h-5 text-sage-600" />
                      <h4 className="text-lg font-medium text-nordic-800">{warehouse.name}</h4>
                      {warehouse.capacity && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {warehouse.capacity}t
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-nordic-700">Ubicazione:</span>
                        <p className="text-nordic-600">{warehouse.address}</p>
                        <p className="text-nordic-600">{warehouse.city}</p>
                      </div>
                      <div>
                        {warehouse.contactPerson && (
                          <div className="mb-1">
                            <span className="font-medium text-nordic-700">Responsabile:</span>
                            <p className="text-nordic-600">{warehouse.contactPerson}</p>
                          </div>
                        )}
                        {warehouse.phone && (
                          <div className="mb-1">
                            <span className="font-medium text-nordic-700">Tel:</span>
                            <p className="text-nordic-600">{warehouse.phone}</p>
                          </div>
                        )}
                        {warehouse.email && (
                          <div className="mb-1">
                            <span className="font-medium text-nordic-700">Email:</span>
                            <p className="text-nordic-600">{warehouse.email}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {warehouse.productTypes && (
                      <div className="mt-3 p-2 bg-green-50 rounded">
                        <span className="font-medium text-green-800">Prodotti:</span>
                        <p className="text-green-700 text-sm">{warehouse.productTypes}</p>
                      </div>
                    )}
                    {warehouse.notes && (
                      <div className="mt-3 p-2 bg-nordic-50 rounded">
                        <span className="font-medium text-nordic-700">Note:</span>
                        <p className="text-nordic-600 text-sm">{warehouse.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(warehouse)}
                      className="p-2 text-nordic-600 hover:bg-nordic-100 rounded-lg transition-colors"
                    >
                      <SafeIcon icon={FiEdit} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(warehouse.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <SafeIcon icon={FiTrash} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-nordic-200 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-nordic-600 border border-nordic-300 rounded-lg hover:bg-nordic-50 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiSave} className="w-4 h-4" />
            Salva Modifiche
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VendorWarehouseManager;