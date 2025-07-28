import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEdit, FiTrash, FiUser, FiPhone, FiMail, FiMapPin, FiCreditCard, FiSave, FiX } = FiIcons;

const ContactManager = ({ entity, type, onClose, onUpdate }) => {
  const [contacts, setContacts] = useState(entity.contacts || []);
  const [addresses, setAddresses] = useState(entity.addresses || []);
  const [bankAccounts, setBankAccounts] = useState(entity.bankAccounts || []);
  const [activeTab, setActiveTab] = useState('contacts');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formType, setFormType] = useState('contact');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const tabs = [
    { id: 'contacts', name: 'Contatti', icon: FiUser },
    { id: 'addresses', name: 'Indirizzi', icon: FiMapPin },
    { id: 'banks', name: 'Banche', icon: FiCreditCard }
  ];

  const onSubmit = (data) => {
    const itemData = {
      ...data,
      id: editingItem ? editingItem.id : Date.now(),
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString()
    };

    if (formType === 'contact') {
      if (editingItem) {
        setContacts(prev => prev.map(c => c.id === editingItem.id ? itemData : c));
        toast.success('Contatto aggiornato');
      } else {
        setContacts(prev => [...prev, itemData]);
        toast.success('Contatto aggiunto');
      }
    } else if (formType === 'address') {
      if (editingItem) {
        setAddresses(prev => prev.map(a => a.id === editingItem.id ? itemData : a));
        toast.success('Indirizzo aggiornato');
      } else {
        setAddresses(prev => [...prev, itemData]);
        toast.success('Indirizzo aggiunto');
      }
    } else if (formType === 'bank') {
      if (editingItem) {
        setBankAccounts(prev => prev.map(b => b.id === editingItem.id ? itemData : b));
        toast.success('Conto bancario aggiornato');
      } else {
        setBankAccounts(prev => [...prev, itemData]);
        toast.success('Conto bancario aggiunto');
      }
    }

    reset();
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    setFormType(type);
    Object.keys(item).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        setValue(key, item[key]);
      }
    });
    setShowForm(true);
  };

  const handleDelete = (itemId, type) => {
    if (window.confirm('Sei sicuro di voler eliminare questo elemento?')) {
      if (type === 'contact') {
        setContacts(prev => prev.filter(c => c.id !== itemId));
      } else if (type === 'address') {
        setAddresses(prev => prev.filter(a => a.id !== itemId));
      } else if (type === 'bank') {
        setBankAccounts(prev => prev.filter(b => b.id !== itemId));
      }
      toast.success('Elemento eliminato');
    }
  };

  const handleSave = () => {
    const updatedEntity = {
      ...entity,
      contacts,
      addresses,
      bankAccounts
    };
    onUpdate(entity.id, updatedEntity);
    onClose();
  };

  const renderContactForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-nordic-700 mb-2">Nome *</label>
          <input
            {...register('name', { required: 'Nome obbligatorio' })}
            type="text"
            className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="Nome e Cognome"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-nordic-700 mb-2">Ruolo</label>
          <input
            {...register('role')}
            type="text"
            className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="es. Responsabile Acquisti"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-nordic-700 mb-2">Telefono</label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="+39 123 456 7890"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-nordic-700 mb-2">Email</label>
          <input
            {...register('email', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email non valida'
              }
            })}
            type="email"
            className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="contatto@esempio.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-nordic-700 mb-2">Note</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
          placeholder="Note aggiuntive..."
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          {...register('isPrimary')}
          type="checkbox"
          className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
        />
        <span className="text-sm font-medium text-nordic-700">Contatto principale</span>
      </div>
    </div>
  );

  const renderAddressForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-nordic-700 mb-2">Tipo Indirizzo *</label>
        <select
          {...register('type', { required: 'Tipo obbligatorio' })}
          className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
        >
          <option value="">Seleziona tipo...</option>
          <option value="legal">Sede Legale</option>
          <option value="operational">Sede Operativa</option>
          <option value="warehouse">Magazzino</option>
          <option value="delivery">Consegna</option>
          <option value="billing">Fatturazione</option>
        </select>
        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-nordic-700 mb-2">Nome/Descrizione</label>
        <input
          {...register('name')}
          type="text"
          className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
          placeholder="es. Magazzino Centrale"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-nordic-700 mb-2">Indirizzo *</label>
          <input
            {...register('address', { required: 'Indirizzo obbligatorio' })}
            type="text"
            className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="Via, numero civico"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-nordic-700 mb-2">Città *</label>
          <input
            {...register('city', { required: 'Città obbligatoria' })}
            type="text"
            className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="CAP Città Provincia"
          />
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-nordic-700 mb-2">Persona di Riferimento</label>
          <input
            {...register('contactPerson')}
            type="text"
            className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="Nome referente"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-nordic-700 mb-2">Telefono</label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="+39 123 456 7890"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-nordic-700 mb-2">Note</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
          placeholder="Note aggiuntive..."
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          {...register('isPrimary')}
          type="checkbox"
          className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
        />
        <span className="text-sm font-medium text-nordic-700">Indirizzo principale</span>
      </div>
    </div>
  );

  const renderBankForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-nordic-700 mb-2">Nome Banca *</label>
          <input
            {...register('bankName', { required: 'Nome banca obbligatorio' })}
            type="text"
            className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="es. Banca Intesa"
          />
          {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-nordic-700 mb-2">IBAN *</label>
          <input
            {...register('iban', { required: 'IBAN obbligatorio' })}
            type="text"
            className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="IT60 X054 2811 1010 0000 0123 456"
          />
          {errors.iban && <p className="text-red-500 text-sm mt-1">{errors.iban.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-nordic-700 mb-2">BIC/SWIFT</label>
          <input
            {...register('bic')}
            type="text"
            className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="es. BCITITMM"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-nordic-700 mb-2">Filiale</label>
          <input
            {...register('branch')}
            type="text"
            className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            placeholder="es. Milano Centro"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-nordic-700 mb-2">Note</label>
        <textarea
          {...register('notes')}
          rows={2}
          className="w-full px-3 py-2 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
          placeholder="Note aggiuntive..."
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          {...register('isPrimary')}
          type="checkbox"
          className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
        />
        <span className="text-sm font-medium text-nordic-700">Conto principale</span>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'contacts':
        return (
          <div className="space-y-4">
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-nordic-500">
                <SafeIcon icon={FiUser} className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessun contatto aggiunto</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="bg-white border border-nordic-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-medium text-nordic-800">{contact.name}</h4>
                        {contact.isPrimary && (
                          <span className="bg-sage-100 text-sage-700 text-xs px-2 py-1 rounded-full">
                            Principale
                          </span>
                        )}
                      </div>
                      {contact.role && <p className="text-sm text-nordic-600 mb-2">{contact.role}</p>}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <SafeIcon icon={FiPhone} className="w-4 h-4 text-nordic-400" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <SafeIcon icon={FiMail} className="w-4 h-4 text-nordic-400" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                      </div>
                      {contact.notes && (
                        <p className="text-sm text-nordic-500 mt-2">{contact.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(contact, 'contact')}
                        className="p-2 text-nordic-600 hover:bg-nordic-100 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiEdit} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id, 'contact')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="text-center py-8 text-nordic-500">
                <SafeIcon icon={FiMapPin} className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessun indirizzo aggiunto</p>
              </div>
            ) : (
              addresses.map((address) => (
                <div key={address.id} className="bg-white border border-nordic-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <SafeIcon icon={FiMapPin} className="w-5 h-5 text-sage-600" />
                        <h4 className="text-lg font-medium text-nordic-800">
                          {address.name || address.type}
                        </h4>
                        {address.isPrimary && (
                          <span className="bg-sage-100 text-sage-700 text-xs px-2 py-1 rounded-full">
                            Principale
                          </span>
                        )}
                        <span className="bg-nordic-100 text-nordic-600 text-xs px-2 py-1 rounded-full">
                          {address.type}
                        </span>
                      </div>
                      <div className="text-sm text-nordic-600 space-y-1">
                        <p>{address.address}</p>
                        <p>{address.city}</p>
                        {address.contactPerson && (
                          <p>Riferimento: {address.contactPerson}</p>
                        )}
                        {address.phone && (
                          <div className="flex items-center gap-2">
                            <SafeIcon icon={FiPhone} className="w-4 h-4 text-nordic-400" />
                            <span>{address.phone}</span>
                          </div>
                        )}
                      </div>
                      {address.notes && (
                        <p className="text-sm text-nordic-500 mt-2">{address.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(address, 'address')}
                        className="p-2 text-nordic-600 hover:bg-nordic-100 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiEdit} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id, 'address')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'banks':
        return (
          <div className="space-y-4">
            {bankAccounts.length === 0 ? (
              <div className="text-center py-8 text-nordic-500">
                <SafeIcon icon={FiCreditCard} className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessun conto bancario aggiunto</p>
              </div>
            ) : (
              bankAccounts.map((bank) => (
                <div key={bank.id} className="bg-white border border-nordic-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <SafeIcon icon={FiCreditCard} className="w-5 h-5 text-sage-600" />
                        <h4 className="text-lg font-medium text-nordic-800">{bank.bankName}</h4>
                        {bank.isPrimary && (
                          <span className="bg-sage-100 text-sage-700 text-xs px-2 py-1 rounded-full">
                            Principale
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-nordic-600 space-y-1">
                        <p>IBAN: {bank.iban}</p>
                        {bank.bic && <p>BIC: {bank.bic}</p>}
                        {bank.branch && <p>Filiale: {bank.branch}</p>}
                      </div>
                      {bank.notes && (
                        <p className="text-sm text-nordic-500 mt-2">{bank.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(bank, 'bank')}
                        className="p-2 text-nordic-600 hover:bg-nordic-100 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiEdit} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bank.id, 'bank')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
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
            <h2 className="text-xl font-semibold text-nordic-800">Gestione Contatti e Indirizzi</h2>
            <p className="text-sm text-nordic-500">{entity.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-nordic-400 hover:text-nordic-600"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-nordic-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-sage-500 text-sage-600'
                    : 'border-transparent text-nordic-500 hover:text-nordic-700 hover:border-nordic-300'
                }`}
              >
                <SafeIcon icon={tab.icon} className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-nordic-800">
            {activeTab === 'contacts' && `Contatti (${contacts.length})`}
            {activeTab === 'addresses' && `Indirizzi (${addresses.length})`}
            {activeTab === 'banks' && `Conti Bancari (${bankAccounts.length})`}
          </h3>
          <button
            onClick={() => {
              setFormType(activeTab === 'contacts' ? 'contact' : activeTab === 'addresses' ? 'address' : 'bank');
              setShowForm(true);
            }}
            className="bg-sage-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sage-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            Aggiungi
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-nordic-50 rounded-lg p-4 mb-6"
          >
            <h4 className="text-md font-medium text-nordic-800 mb-4">
              {editingItem ? 'Modifica' : 'Nuovo'} {' '}
              {formType === 'contact' ? 'Contatto' : formType === 'address' ? 'Indirizzo' : 'Conto Bancario'}
            </h4>
            <form onSubmit={handleSubmit(onSubmit)}>
              {formType === 'contact' && renderContactForm()}
              {formType === 'address' && renderAddressForm()}
              {formType === 'bank' && renderBankForm()}
              <div className="flex justify-end gap-3 mt-4">
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
                  {editingItem ? 'Aggiorna' : 'Aggiungi'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Content */}
        {renderContent()}

        {/* Actions */}
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

export default ContactManager;