import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useSuggestionStore } from '@/store/suggestionStore';

const { FiPlus, FiEdit, FiTrash, FiSave, FiX, FiTag, FiList } = FiIcons;

const SuggestionManager = () => {
  const { suggestions, addSuggestion, updateSuggestion, deleteSuggestion } = useSuggestionStore();
  const [activeCategory, setActiveCategory] = useState('product');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const categories = [
    { id: 'product', name: 'Prodotto', icon: FiTag, color: 'bg-blue-500' },
    { id: 'type', name: 'Tipologia', icon: FiList, color: 'bg-green-500' },
    { id: 'packaging', name: 'Imballaggio', icon: FiTag, color: 'bg-purple-500' },
    { id: 'origin', name: 'Origine', icon: FiTag, color: 'bg-orange-500' },
    { id: 'quantity', name: 'Quantità', icon: FiTag, color: 'bg-pink-500' }
  ];

  const onSubmit = async (data) => {
    try {
      const suggestionData = {
        ...data,
        category: activeCategory,
        usage: 0,
        createdAt: new Date().toISOString()
      };

      if (editingItem) {
        updateSuggestion(editingItem.id, { ...suggestionData, usage: editingItem.usage });
        toast.success('Suggerimento aggiornato con successo!');
      } else {
        addSuggestion(suggestionData);
        toast.success('Suggerimento aggiunto con successo!');
      }

      reset();
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setValue('value', item.value);
    setValue('description', item.description);
    setValue('isActive', item.isActive);
    setShowForm(true);
  };

  const handleDelete = (itemId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo suggerimento?')) {
      deleteSuggestion(itemId);
      toast.success('Suggerimento eliminato');
    }
  };

  const getCategorySuggestions = (category) => {
    return suggestions.filter(s => s.category === category).sort((a, b) => b.usage - a.usage);
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-nordic-800">Gestione Suggerimenti</h1>
          <p className="text-sm text-nordic-500 mt-1">
            Configura i suggerimenti per i campi del form ordini
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="bg-sage-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sage-700 transition-colors duration-200 flex items-center gap-2"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          Nuovo Suggerimento
        </motion.button>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-xl border border-nordic-200 p-6">
        <div className="border-b border-nordic-200 mb-6">
          <nav className="flex space-x-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeCategory === category.id
                    ? 'border-sage-500 text-sage-600'
                    : 'border-transparent text-nordic-500 hover:text-nordic-700 hover:border-nordic-300'
                }`}
              >
                <SafeIcon icon={category.icon} className="w-4 h-4" />
                {category.name}
                <span className="bg-nordic-100 text-nordic-600 text-xs px-2 py-1 rounded-full">
                  {getCategorySuggestions(category.id).length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Suggestions List */}
        <div className="space-y-3">
          {getCategorySuggestions(activeCategory).length === 0 ? (
            <div className="text-center py-8 text-nordic-500">
              <SafeIcon icon={FiTag} className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nessun suggerimento per questa categoria</p>
              <p className="text-sm">Aggiungi il primo suggerimento</p>
            </div>
          ) : (
            getCategorySuggestions(activeCategory).map((suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border rounded-lg hover:shadow-sm transition-all ${
                  suggestion.isActive ? 'border-nordic-200 bg-white' : 'border-nordic-200 bg-nordic-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        suggestion.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`}></span>
                      <div>
                        <p className="font-medium text-nordic-800">{suggestion.value}</p>
                        {suggestion.description && (
                          <p className="text-sm text-nordic-500">{suggestion.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-nordic-600">
                        {suggestion.usage} utilizzi
                      </p>
                      <p className="text-xs text-nordic-500">
                        {new Date(suggestion.createdAt).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(suggestion)}
                        className="p-2 text-nordic-600 hover:bg-nordic-100 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiEdit} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(suggestion.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <SafeIcon icon={FiTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
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
            className="bg-white rounded-xl p-6 w-full max-w-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-nordic-800">
                {editingItem ? 'Modifica Suggerimento' : 'Nuovo Suggerimento'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  reset();
                }}
                className="text-nordic-400 hover:text-nordic-600"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Categoria
                </label>
                <div className="flex items-center gap-2 p-3 bg-nordic-50 rounded-lg">
                  <SafeIcon 
                    icon={getCategoryInfo(activeCategory)?.icon || FiTag} 
                    className={`w-5 h-5 text-white p-1 rounded ${getCategoryInfo(activeCategory)?.color || 'bg-gray-500'}`}
                  />
                  <span className="font-medium text-nordic-800">
                    {getCategoryInfo(activeCategory)?.name || activeCategory}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Valore *
                </label>
                <input
                  {...register('value', { required: 'Valore obbligatorio' })}
                  type="text"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder={`es. ${
                    activeCategory === 'product' ? 'CIPOLLE DORATE PRECOCI' :
                    activeCategory === 'type' ? 'SGAMBATE, SELEZIONATE E CALIBRATE 40/60 MM' :
                    activeCategory === 'packaging' ? 'BINS COMPRATORE TARA REALE' :
                    activeCategory === 'origin' ? 'ITALIA (VENETO)' :
                    activeCategory === 'quantity' ? '2,5 AUTOTRENI' :
                    'Inserisci valore'
                  }`}
                />
                {errors.value && (
                  <p className="text-red-500 text-sm mt-1">{errors.value.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Descrizione
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="Descrizione opzionale del suggerimento..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    {...register('isActive')}
                    type="checkbox"
                    defaultChecked={true}
                    className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                  />
                  <span className="text-sm font-medium text-nordic-700">
                    Attivo (mostra nei suggerimenti)
                  </span>
                </label>
              </div>

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
                  className="px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors flex items-center gap-2"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  {editingItem ? 'Aggiorna' : 'Salva'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-nordic-200 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <SafeIcon icon={FiTag} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-nordic-800">Suggerimenti Totali</h3>
              <p className="text-sm text-nordic-500">In tutte le categorie</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-nordic-800">{suggestions.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-nordic-200 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <SafeIcon icon={FiList} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-nordic-800">Suggerimenti Attivi</h3>
              <p className="text-sm text-nordic-500">Visibili agli utenti</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-nordic-800">
            {suggestions.filter(s => s.isActive).length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-nordic-200 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <SafeIcon icon={FiTag} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-nordic-800">Più Usato</h3>
              <p className="text-sm text-nordic-500">Suggerimento top</p>
            </div>
          </div>
          <p className="text-lg font-bold text-nordic-800">
            {suggestions.length > 0 
              ? suggestions.reduce((max, s) => s.usage > max.usage ? s : max, suggestions[0])?.value?.substring(0, 20) + '...'
              : 'N/A'
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SuggestionManager;