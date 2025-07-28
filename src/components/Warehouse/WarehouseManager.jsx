import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit, FiTrash, FiMapPin, FiUser, FiMail, FiPhone, FiDollarSign } = FiIcons;

const WarehouseManager = ({ warehouses = [], onUpdate, title = "Magazzini" }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formType, setFormType] = useState('warehouse'); // warehouse, contact, bank
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const newItem = {
        ...data,
        id: editingItem ? editingItem.id : Date.now(),
        type: formType,
        createdAt: editingItem ? editingItem.createdAt : new Date().toISOString()
      };

      let updatedWarehouses;
      if (editingItem) {
        updatedWarehouses = warehouses.map(item => 
          item.id === editingItem.id ? newItem : item
        );
        toast.success(`${getTypeLabel(formType)} aggiornato con successo!`);
      } else {
        updatedWarehouses = [...warehouses, newItem];
        toast.success(`${getTypeLabel(formType)} aggiunto con successo!`);
      }

      onUpdate(updatedWarehouses);
      reset();
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormType(item.type);
    
    // Populate form based on type
    Object.keys(item).forEach(key => {
      setValue(key, item[key]);
    });
    
    setShowForm(true);
  };

  const handleDelete = (itemId) => {
    const item = warehouses.find(w => w.id === itemId);
    if (window.confirm(`Sei sicuro di voler eliminare questo ${getTypeLabel(item.type).toLowerCase()}?`)) {
      const updatedWarehouses = warehouses.filter(item => item.id !== itemId);
      onUpdate(updatedWarehouses);
      toast.success(`${getTypeLabel(item.type)} eliminato`);
    }
  };

  const openForm = (type) => {
    setFormType(type);
    setEditingItem(null);
    reset();
    setShowForm(true);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'warehouse': return 'Magazzino';
      case 'contact': return 'Contatto';
      case 'bank': return 'Banca';
      default: return 'Elemento';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warehouse': return FiMapPin;
      case 'contact': return FiUser;
      case 'bank': return FiDollarSign;
      default: return FiMapPin;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'warehouse': return 'bg-blue-500';
      case 'contact': return 'bg-green-500';
      case 'bank': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const renderFormFields = () => {
    switch (formType) {
      case 'warehouse':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                Nome Magazzino *
              </label>
              <input
                {...register('name', { required: 'Nome obbligatorio' })}
                type="text"
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="es. Magazzino Principale"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                Indirizzo *
              </label>
              <input
                {...register('address', { required: 'Indirizzo obbligatorio' })}
                type="text"
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="Via, numero civico, CAP, Città"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Responsabile
                </label>
                <input
                  {...register('manager')}
                  type="text"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="+39 123 456 7890"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                Note
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="Note aggiuntive sul magazzino..."
              />
            </div>
          </>
        );

      case 'contact':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Nome *
                </label>
                <input
                  {...register('firstName', { required: 'Nome obbligatorio' })}
                  type="text"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="Nome"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Cognome *
                </label>
                <input
                  {...register('lastName', { required: 'Cognome obbligatorio' })}
                  type="text"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="Cognome"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                Ruolo
              </label>
              <input
                {...register('role')}
                type="text"
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="es. Responsabile Acquisti, Direttore Commerciale"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
                  placeholder="email@esempio.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
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
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  {...register('isPrimary')}
                  type="checkbox"
                  className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                />
                <span className="text-sm font-medium text-nordic-700">
                  Contatto principale
                </span>
              </label>
            </div>
          </>
        );

      case 'bank':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                Nome Banca *
              </label>
              <input
                {...register('bankName', { required: 'Nome banca obbligatorio' })}
                type="text"
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="es. Intesa Sanpaolo"
              />
              {errors.bankName && (
                <p className="text-red-500 text-sm mt-1">{errors.bankName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  IBAN *
                </label>
                <input
                  {...register('iban', { required: 'IBAN obbligatorio' })}
                  type="text"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="IT60 X054 2811 1010 0000 0123 456"
                />
                {errors.iban && (
                  <p className="text-red-500 text-sm mt-1">{errors.iban.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  BIC/SWIFT
                </label>
                <input
                  {...register('bic')}
                  type="text"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="BCITITMM"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                Intestatario
              </label>
              <input
                {...register('accountHolder')}
                type="text"
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="Nome intestatario del conto"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  {...register('isPrimary')}
                  type="checkbox"
                  className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                />
                <span className="text-sm font-medium text-nordic-700">
                  Conto principale
                </span>
              </label>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const groupedItems = warehouses.reduce((groups, item) => {
    const type = item.type || 'warehouse';
    if (!groups[type]) groups[type] = [];
    groups[type].push(item);
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      {/* Add buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => openForm('warehouse')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          Aggiungi Magazzino
        </button>
        
        <button
          onClick={() => openForm('contact')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          Aggiungi Contatto
        </button>
        
        <button
          onClick={() => openForm('bank')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          Aggiungi Banca
        </button>
      </div>

      {/* Form Modal */}
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
                {editingItem ? `Modifica ${getTypeLabel(formType)}` : `Nuovo ${getTypeLabel(formType)}`}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  reset();
                }}
                className="text-nordic-400 hover:text-nordic-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {renderFormFields()}
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
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
                  {editingItem ? 'Aggiorna' : 'Salva'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Items Display */}
      {Object.entries(groupedItems).map(([type, items]) => (
        <div key={type} className="space-y-4">
          <h3 className="text-lg font-semibold text-nordic-800 flex items-center gap-2">
            <SafeIcon icon={getTypeIcon(type)} className="w-5 h-5" />
            {getTypeLabel(type)}i ({items.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-nordic-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`${getTypeColor(type)} p-2 rounded-lg`}>
                      <SafeIcon icon={getTypeIcon(type)} className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-nordic-800">
                        {type === 'warehouse' && item.name}
                        {type === 'contact' && `${item.firstName} ${item.lastName}`}
                        {type === 'bank' && item.bankName}
                        {item.isPrimary && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Principale</span>}
                      </h4>
                      {type === 'contact' && item.role && (
                        <p className="text-sm text-nordic-500">{item.role}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 text-nordic-600 hover:bg-nordic-100 rounded transition-colors"
                    >
                      <SafeIcon icon={FiEdit} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <SafeIcon icon={FiTrash} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {type === 'warehouse' && (
                    <>
                      <div className="text-nordic-600">{item.address}</div>
                      {item.manager && (
                        <div className="flex items-center gap-1 text-nordic-500">
                          <SafeIcon icon={FiUser} className="w-3 h-3" />
                          {item.manager}
                        </div>
                      )}
                      {item.phone && (
                        <div className="flex items-center gap-1 text-nordic-500">
                          <SafeIcon icon={FiPhone} className="w-3 h-3" />
                          {item.phone}
                        </div>
                      )}
                    </>
                  )}
                  
                  {type === 'contact' && (
                    <>
                      {item.email && (
                        <div className="flex items-center gap-1 text-nordic-500">
                          <SafeIcon icon={FiMail} className="w-3 h-3" />
                          {item.email}
                        </div>
                      )}
                      {item.phone && (
                        <div className="flex items-center gap-1 text-nordic-500">
                          <SafeIcon icon={FiPhone} className="w-3 h-3" />
                          {item.phone}
                        </div>
                      )}
                    </>
                  )}
                  
                  {type === 'bank' && (
                    <>
                      <div className="text-nordic-600 font-mono text-xs">{item.iban}</div>
                      {item.bic && (
                        <div className="text-nordic-500">BIC: {item.bic}</div>
                      )}
                      {item.accountHolder && (
                        <div className="text-nordic-500">Intestatario: {item.accountHolder}</div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {warehouses.length === 0 && (
        <div className="text-center py-8 text-nordic-500">
          <SafeIcon icon={FiMapPin} className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nessun elemento aggiunto</p>
          <p className="text-sm">Inizia aggiungendo magazzini, contatti o dati bancari</p>
        </div>
      )}
    </div>
  );
};

export default WarehouseManager;