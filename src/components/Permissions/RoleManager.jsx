import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useAuthStore from '@/store/authStore';

const { FiUsers, FiShield, FiEdit, FiTrash, FiPlus, FiLock, FiUnlock } = FiIcons;

const RoleManager = () => {
  const { user, updateUserRole, hasPermission } = useAuthStore();
  const [users, setUsers] = useState([
    {
      id: 1,
      email: 'admin@trade.com',
      name: 'Andrea Amministratore',
      role: 'admin',
      permissions: ['all'],
      lastLogin: new Date(),
      status: 'active'
    },
    {
      id: 2,
      email: 'secretary@trade.com',
      name: 'Segreteria',
      role: 'manager',
      permissions: ['orders.read', 'orders.write', 'clients.read', 'clients.write'],
      lastLogin: new Date(),
      status: 'active'
    },
    {
      id: 3,
      email: 'mobile@trade.com',
      name: 'Utente Mobile',
      role: 'mobile',
      permissions: ['orders.read.public'],
      lastLogin: new Date(),
      status: 'active'
    }
  ]);

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const roles = {
    admin: {
      name: 'Amministratore',
      description: 'Accesso completo a tutte le funzionalità',
      color: 'bg-red-500',
      permissions: ['all']
    },
    manager: {
      name: 'Manager',
      description: 'Gestione ordini, clienti e fornitori',
      color: 'bg-blue-500',
      permissions: [
        'orders.read', 'orders.write', 'orders.delete',
        'clients.read', 'clients.write', 'clients.delete',
        'vendors.read', 'vendors.write', 'vendors.delete',
        'analytics.read', 'reports.read'
      ]
    },
    user: {
      name: 'Utente',
      description: 'Visualizzazione e creazione ordini',
      color: 'bg-green-500',
      permissions: [
        'orders.read', 'orders.write',
        'clients.read', 'vendors.read'
      ]
    },
    mobile: {
      name: 'Mobile',
      description: 'Accesso limitato per app mobile',
      color: 'bg-purple-500',
      permissions: ['orders.read.public']
    }
  };

  const availablePermissions = [
    { key: 'orders.read', name: 'Visualizza Ordini', category: 'Ordini' },
    { key: 'orders.write', name: 'Crea/Modifica Ordini', category: 'Ordini' },
    { key: 'orders.delete', name: 'Elimina Ordini', category: 'Ordini' },
    { key: 'orders.read.public', name: 'Visualizza Ordini Pubblici', category: 'Ordini' },
    { key: 'clients.read', name: 'Visualizza Clienti', category: 'Clienti' },
    { key: 'clients.write', name: 'Crea/Modifica Clienti', category: 'Clienti' },
    { key: 'clients.delete', name: 'Elimina Clienti', category: 'Clienti' },
    { key: 'vendors.read', name: 'Visualizza Fornitori', category: 'Fornitori' },
    { key: 'vendors.write', name: 'Crea/Modifica Fornitori', category: 'Fornitori' },
    { key: 'vendors.delete', name: 'Elimina Fornitori', category: 'Fornitori' },
    { key: 'analytics.read', name: 'Visualizza Analytics', category: 'Analytics' },
    { key: 'reports.read', name: 'Genera Report', category: 'Report' },
    { key: 'invoices.read', name: 'Visualizza Fatture', category: 'Fatture' },
    { key: 'invoices.write', name: 'Crea/Modifica Fatture', category: 'Fatture' },
    { key: 'users.read', name: 'Visualizza Utenti', category: 'Utenti' },
    { key: 'users.write', name: 'Gestisci Utenti', category: 'Utenti' }
  ];

  // Only admins can access this component
  if (!hasPermission('users.read')) {
    return (
      <div className="p-8 text-center">
        <SafeIcon icon={FiLock} className="w-16 h-16 text-nordic-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-nordic-700 mb-2">Accesso Negato</h2>
        <p className="text-nordic-500">Non hai i permessi per accedere a questa sezione.</p>
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      const userData = {
        ...data,
        permissions: data.permissions || [],
        status: 'active'
      };

      if (editingUser) {
        setUsers(prev => prev.map(u => 
          u.id === editingUser.id ? { ...u, ...userData } : u
        ));
        toast.success('Utente aggiornato con successo!');
      } else {
        const newUser = {
          id: Date.now(),
          ...userData,
          lastLogin: new Date()
        };
        setUsers(prev => [...prev, newUser]);
        toast.success('Utente creato con successo!');
      }

      reset();
      setShowUserForm(false);
      setEditingUser(null);
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setValue('email', user.email);
    setValue('name', user.name);
    setValue('role', user.role);
    setValue('permissions', user.permissions);
    setShowUserForm(true);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Utente eliminato');
    }
  };

  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ));
    toast.success('Stato utente aggiornato');
  };

  const getRoleInfo = (roleKey) => roles[roleKey] || roles.user;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-nordic-800">Gestione Ruoli e Permessi</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUserForm(true)}
          className="bg-sage-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sage-700 transition-colors duration-200 flex items-center gap-2"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          Nuovo Utente
        </motion.button>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(roles).map(([key, role]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-nordic-200 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`${role.color} p-2 rounded-lg`}>
                <SafeIcon icon={FiShield} className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-nordic-800">{role.name}</h3>
                <p className="text-sm text-nordic-500">
                  {users.filter(u => u.role === key).length} utenti
                </p>
              </div>
            </div>
            <p className="text-sm text-nordic-600">{role.description}</p>
          </motion.div>
        ))}
      </div>

      {/* User Form Modal */}
      {showUserForm && (
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
                {editingUser ? 'Modifica Utente' : 'Nuovo Utente'}
              </h2>
              <button
                onClick={() => {
                  setShowUserForm(false);
                  setEditingUser(null);
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
                    Email *
                  </label>
                  <input
                    {...register('email', { 
                      required: 'Email obbligatoria',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email non valida'
                      }
                    })}
                    type="email"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="utente@esempio.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Nome *
                  </label>
                  <input
                    {...register('name', { required: 'Nome obbligatorio' })}
                    type="text"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="Nome Cognome"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Ruolo *
                  </label>
                  <select
                    {...register('role', { required: 'Ruolo obbligatorio' })}
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  >
                    <option value="">Seleziona ruolo...</option>
                    {Object.entries(roles).map(([key, role]) => (
                      <option key={key} value={key}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                  )}
                </div>
              </div>

              {/* Custom Permissions */}
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Permessi Personalizzati (opzionale)
                </label>
                <div className="bg-nordic-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availablePermissions.map((permission) => (
                      <label key={permission.key} className="flex items-center gap-2">
                        <input
                          {...register('permissions')}
                          type="checkbox"
                          value={permission.key}
                          className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                        />
                        <span className="text-sm text-nordic-700">
                          {permission.name}
                          <span className="text-nordic-500 ml-1">({permission.category})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-nordic-500 mt-1">
                  I permessi personalizzati si aggiungono a quelli del ruolo selezionato
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserForm(false);
                    setEditingUser(null);
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
                  {editingUser ? 'Aggiorna' : 'Crea Utente'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-nordic-200"
      >
        <div className="p-6 border-b border-nordic-200">
          <h2 className="text-lg font-semibold text-nordic-800">Utenti del Sistema</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-nordic-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Utente</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Ruolo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Permessi</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Ultimo Accesso</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Stato</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-nordic-700">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nordic-200">
              {users.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                return (
                  <tr key={user.id} className="hover:bg-nordic-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                          <SafeIcon icon={FiUsers} className="w-5 h-5 text-sage-600" />
                        </div>
                        <div>
                          <div className="font-medium text-nordic-800">{user.name}</div>
                          <div className="text-sm text-nordic-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`${roleInfo.color} w-3 h-3 rounded-full`}></div>
                        <span className="text-nordic-800">{roleInfo.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-nordic-600">
                        {user.permissions.includes('all') ? 'Tutti' : `${user.permissions.length} permessi`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-nordic-600">
                        {user.lastLogin.toLocaleDateString('it-IT')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <SafeIcon 
                          icon={user.status === 'active' ? FiUnlock : FiLock} 
                          className="w-3 h-3" 
                        />
                        {user.status === 'active' ? 'Attivo' : 'Inattivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-nordic-600 hover:bg-nordic-100 rounded-lg transition-colors"
                        >
                          <SafeIcon icon={FiEdit} className="w-4 h-4" />
                        </button>
                        {user.id !== 1 && ( // Don't allow deleting main admin
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <SafeIcon icon={FiTrash} className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default RoleManager;