import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDigitalWarehouseStore } from '@/store/digitalWarehouseStore';
import ProductImageUploader from './ProductImageUploader';
import ProductDetailModal from './ProductDetailModal';
import useAuthStore from '@/store/authStore';

const {
  FiPlus, FiEdit, FiTrash, FiPackage, FiImage, FiDollarSign, FiUser, FiMapPin,
  FiCalendar, FiSearch, FiFilter, FiEye, FiTruck, FiBarChart3, FiStar, FiTag, FiX, FiUpload, FiCamera
} = FiIcons;

const DigitalWarehouse = () => {
  const { hasPermission } = useAuthStore();
  const {
    products,
    isLoading,
    initializeFromSupabase,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getProductsBySupplier
  } = useDigitalWarehouseStore();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showImageUploader, setShowImageUploader] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [formImages, setFormImages] = useState([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Initialize data from Supabase on component mount
  useEffect(() => {
    initializeFromSupabase();
  }, [initializeFromSupabase]);

  // Check permissions
  if (!hasPermission('warehouse.read')) {
    return (
      <div className="p-8 text-center">
        <SafeIcon icon={FiPackage} className="w-16 h-16 text-nordic-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-nordic-700 mb-2">Accesso Negato</h2>
        <p className="text-nordic-500">Non hai i permessi per accedere al magazzino digitale.</p>
      </div>
    );
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesSupplier = supplierFilter === 'all' || product.supplier?.id === supplierFilter;
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  // Get unique categories and suppliers for filters
  const categories = [...new Set(products.map(p => p.category))];
  const suppliers = [...new Set(products.map(p => p.supplier?.name).filter(Boolean))];

  const onSubmit = async (data) => {
    try {
      const productData = {
        ...data,
        price: parseFloat(data.price),
        minQuantity: parseInt(data.minQuantity) || 0,
        maxQuantity: parseInt(data.maxQuantity) || 0,
        currentStock: parseInt(data.currentStock) || 0,
        supplier: data.supplier ? JSON.parse(data.supplier) : null,
        images: formImages,
        specifications: data.specifications ? data.specifications.split('\n').filter(s => s.trim()) : [],
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : []
      };

      let savedProduct;
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        savedProduct = { ...editingProduct, ...productData };
        toast.success('Prodotto aggiornato con successo!');
      } else {
        savedProduct = await addProduct(productData);
        toast.success('Prodotto aggiunto con successo!');
      }

      reset();
      setShowForm(false);
      setEditingProduct(null);
      setFormImages([]);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Errore durante il salvataggio');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormImages(product.images || []);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('category', product.category);
    setValue('price', product.price);
    setValue('unit', product.unit);
    setValue('minQuantity', product.minQuantity);
    setValue('maxQuantity', product.maxQuantity);
    setValue('currentStock', product.currentStock);
    setValue('origin', product.origin);
    setValue('season', product.season);
    setValue('supplier', product.supplier ? JSON.stringify(product.supplier) : '');
    setValue('specifications', product.specifications?.join('\n') || '');
    setValue('tags', product.tags?.join(',') || '');
    setValue('notes', product.notes);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      await deleteProduct(productId);
      toast.success('Prodotto eliminato');
    }
  };

  const handleImageUpdate = async (productId, images) => {
    try {
      const product = products.find(p => p.id === productId);
      if (product) {
        const updatedProduct = { ...product, images };
        await updateProduct(productId, updatedProduct);
        toast.success('Immagini prodotto aggiornate');
      }
    } catch (error) {
      console.error('Error updating images:', error);
      toast.error('Errore durante l\'aggiornamento delle immagini');
    }
  };

  const handleFormImageUpdate = (images) => {
    setFormImages(images);
    toast.success(`${images.length} immagini pronte per il salvataggio`);
  };

  const openForm = () => {
    setEditingProduct(null);
    setFormImages([]);
    reset();
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormImages([]);
    reset();
  };

  const getProductCardStyle = (product) => {
    const isLowStock = product.currentStock <= product.minQuantity;
    const isOutOfStock = product.currentStock === 0;
    if (isOutOfStock) return 'border-red-300 bg-red-50';
    if (isLowStock) return 'border-orange-300 bg-orange-50';
    return 'border-nordic-200 bg-white';
  };

  const renderProductCard = (product) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${getProductCardStyle(product)}`}
    >
      {/* Product Image */}
      <div className="relative mb-4">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg cursor-pointer"
            onClick={() => setShowDetailModal(product)}
            onError={(e) => {
              console.error('Image load error:', e);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback placeholder */}
        <div
          className={`w-full h-48 bg-nordic-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-nordic-200 transition-colors ${
            product.images && product.images.length > 0 ? 'hidden' : 'flex'
          }`}
          onClick={() => setShowDetailModal(product)}
        >
          <SafeIcon icon={FiPackage} className="w-16 h-16 text-nordic-400" />
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          {product.currentStock === 0 ? (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Esaurito
            </span>
          ) : product.currentStock <= product.minQuantity ? (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              Scorte Basse
            </span>
          ) : (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Disponibile
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center gap-1">
            <SafeIcon icon={FiStar} className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-medium">{product.rating}</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-nordic-800 mb-1">{product.name}</h3>
          <p className="text-sm text-nordic-500 line-clamp-2">{product.description}</p>
        </div>

        {/* Category & Origin */}
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {product.category}
          </span>
          {product.origin && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {product.origin}
            </span>
          )}
        </div>

        {/* Price & Supplier */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-nordic-800">
              €{product.price.toFixed(2)}
            </span>
            <span className="text-sm text-nordic-500">/{product.unit}</span>
          </div>
          {product.supplier && (
            <div className="text-xs text-nordic-600">
              <SafeIcon icon={FiTruck} className="w-3 h-3 inline mr-1" />
              {product.supplier.name}
            </div>
          )}
        </div>

        {/* Stock Info */}
        <div className="text-xs text-nordic-600">
          Stock: {product.currentStock || 0} {product.unit}
          {product.minQuantity > 0 && (
            <span className="ml-2">Min: {product.minQuantity}</span>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="text-xs text-nordic-500">+{product.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {hasPermission('warehouse.write') && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-nordic-200">
          <button
            onClick={() => setShowImageUploader(product)}
            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <SafeIcon icon={FiImage} className="w-4 h-4" />
            Foto ({product.images?.length || 0})
          </button>
          <button
            onClick={() => handleEdit(product)}
            className="flex items-center gap-1 px-3 py-1 text-sm text-nordic-600 hover:bg-nordic-100 rounded transition-colors"
          >
            <SafeIcon icon={FiEdit} className="w-4 h-4" />
            Modifica
          </button>
          <button
            onClick={() => handleDelete(product.id)}
            className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <SafeIcon icon={FiTrash} className="w-4 h-4" />
            Elimina
          </button>
        </div>
      )}
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-nordic-800">Magazzino Digitale</h1>
          <p className="text-nordic-500 mt-1">
            Gestisci il catalogo prodotti con immagini, fornitori e prezzi
          </p>
        </div>
        {hasPermission('warehouse.write') && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openForm}
            className="bg-sage-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-sage-700 transition-colors duration-200 flex items-center gap-2"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5" />
            Nuovo Prodotto
          </motion.button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-nordic-200"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-lg">
              <SafeIcon icon={FiPackage} className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-nordic-500">Prodotti Totali</p>
              <p className="text-2xl font-bold text-nordic-800">{products.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-nordic-200"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-3 rounded-lg">
              <SafeIcon icon={FiBarChart3} className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-nordic-500">Disponibili</p>
              <p className="text-2xl font-bold text-nordic-800">
                {products.filter(p => p.currentStock > 0).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-nordic-200"
        >
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-3 rounded-lg">
              <SafeIcon icon={FiTag} className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-nordic-500">Categorie</p>
              <p className="text-2xl font-bold text-nordic-800">{categories.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-nordic-200"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 p-3 rounded-lg">
              <SafeIcon icon={FiTruck} className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-nordic-500">Fornitori</p>
              <p className="text-2xl font-bold text-nordic-800">{suppliers.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-nordic-200 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nordic-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cerca prodotti, descrizione, fornitore..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              <option value="all">Tutte le categorie</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              <option value="all">Tutti i fornitori</option>
              {suppliers.map(supplier => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>
            <div className="flex border border-nordic-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-sage-500 text-white' : 'bg-white text-nordic-600 hover:bg-nordic-50'} transition-colors`}
              >
                Griglia
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 ${viewMode === 'list' ? 'bg-sage-500 text-white' : 'bg-white text-nordic-600 hover:bg-nordic-50'} transition-colors`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
      >
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <SafeIcon icon={FiPackage} className="w-16 h-16 text-nordic-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-nordic-700 mb-2">
              {searchTerm || categoryFilter !== 'all' || supplierFilter !== 'all'
                ? 'Nessun prodotto trovato'
                : 'Nessun prodotto nel magazzino'
              }
            </h3>
            <p className="text-nordic-500">
              {searchTerm || categoryFilter !== 'all' || supplierFilter !== 'all'
                ? 'Prova a modificare i filtri di ricerca'
                : 'Inizia aggiungendo il primo prodotto al catalogo'
              }
            </p>
          </div>
        ) : (
          filteredProducts.map(product => renderProductCard(product))
        )}
      </motion.div>

      {/* Product Form Modal */}
      {showForm && (
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
              <h2 className="text-xl font-semibold text-nordic-800">
                {editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
              </h2>
              <button
                onClick={closeForm}
                className="text-nordic-400 hover:text-nordic-600"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Image Upload Section */}
              <div className="bg-nordic-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-nordic-800 flex items-center gap-2">
                    <SafeIcon icon={FiImage} className="w-5 h-5" />
                    Immagini Prodotto ({formImages.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowImageUploader({ 
                      id: editingProduct?.id || 'new', 
                      name: editingProduct?.name || 'Nuovo Prodotto',
                      images: formImages 
                    })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <SafeIcon icon={FiUpload} className="w-4 h-4" />
                    Gestisci Immagini
                  </button>
                </div>
                
                {/* Image Preview */}
                {formImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formImages.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Image preview error:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                        {image.isPrimary && (
                          <div className="absolute top-1 left-1 bg-sage-500 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
                            <SafeIcon icon={FiStar} className="w-3 h-3" />
                            <span className="hidden sm:inline">Principale</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-nordic-300 rounded-lg">
                    <SafeIcon icon={FiCamera} className="w-8 h-8 text-nordic-400 mx-auto mb-2" />
                    <p className="text-sm text-nordic-500">Nessuna immagine caricata</p>
                    <p className="text-xs text-nordic-400">Clicca "Gestisci Immagini" per aggiungere foto</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Nome Prodotto *
                  </label>
                  <input
                    {...register('name', { required: 'Nome prodotto obbligatorio' })}
                    type="text"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="es. Pomodori San Marzano DOP"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    {...register('category', { required: 'Categoria obbligatoria' })}
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  >
                    <option value="">Seleziona categoria...</option>
                    <option value="Ortaggi">Ortaggi</option>
                    <option value="Frutta">Frutta</option>
                    <option value="Cereali">Cereali</option>
                    <option value="Legumi">Legumi</option>
                    <option value="Erbe Aromatiche">Erbe Aromatiche</option>
                    <option value="Biologico">Biologico</option>
                    <option value="Conserve">Conserve</option>
                    <option value="Altro">Altro</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Descrizione
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="Descrizione dettagliata del prodotto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Prezzo *
                  </label>
                  <input
                    {...register('price', {
                      required: 'Prezzo obbligatorio',
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: 'Prezzo non valido'
                      }
                    })}
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Unità di Misura *
                  </label>
                  <select
                    {...register('unit', { required: 'Unità obbligatoria' })}
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  >
                    <option value="">Seleziona unità...</option>
                    <option value="KG">Chilogrammo (KG)</option>
                    <option value="G">Grammo (G)</option>
                    <option value="L">Litro (L)</option>
                    <option value="PZ">Pezzo (PZ)</option>
                    <option value="CF">Confezione (CF)</option>
                    <option value="SC">Scatola (SC)</option>
                    <option value="Q">Quintale (Q)</option>
                  </select>
                  {errors.unit && (
                    <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Stock Corrente
                  </label>
                  <input
                    {...register('currentStock')}
                    type="number"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Origine
                  </label>
                  <input
                    {...register('origin')}
                    type="text"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="es. Italia (Campania)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Stagionalità
                  </label>
                  <select
                    {...register('season')}
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  >
                    <option value="">Seleziona stagione...</option>
                    <option value="Primavera">Primavera</option>
                    <option value="Estate">Estate</option>
                    <option value="Autunno">Autunno</option>
                    <option value="Inverno">Inverno</option>
                    <option value="Tutto l'anno">Tutto l'anno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Quantità Minima
                  </label>
                  <input
                    {...register('minQuantity')}
                    type="number"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Quantità Massima
                  </label>
                  <input
                    {...register('maxQuantity')}
                    type="number"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Fornitore
                  </label>
                  <select
                    {...register('supplier')}
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  >
                    <option value="">Seleziona fornitore...</option>
                    <option value='{"id": 1, "name": "Cooperativa Agricola Sud", "contact": "info@coopsud.it"}'>
                      Cooperativa Agricola Sud
                    </option>
                    <option value='{"id": 2, "name": "Azienda Biologica Verde", "contact": "ordini@bioverde.it"}'>
                      Azienda Biologica Verde
                    </option>
                    <option value='{"id": 3, "name": "Mercato Ortofrutticolo", "contact": "vendite@mercato.it"}'>
                      Mercato Ortofrutticolo
                    </option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Specifiche Tecniche
                  </label>
                  <textarea
                    {...register('specifications')}
                    rows={4}
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="Una specifica per riga, es:&#10;Calibro: 40-60mm&#10;Colore: Dorato&#10;Certificazione: BIO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Tag
                  </label>
                  <input
                    {...register('tags')}
                    type="text"
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="bio, locale, premium (separati da virgola)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-nordic-700 mb-2">
                    Note
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder="Note aggiuntive..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-nordic-200">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-3 text-nordic-600 border border-nordic-300 rounded-lg hover:bg-nordic-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                >
                  {editingProduct ? 'Aggiorna Prodotto' : 'Salva Prodotto'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Image Uploader Modal */}
      {showImageUploader && (
        <ProductImageUploader
          product={showImageUploader}
          onClose={() => setShowImageUploader(null)}
          onUpdate={showImageUploader.id === 'new' ? handleFormImageUpdate : handleImageUpdate}
        />
      )}

      {/* Product Detail Modal */}
      {showDetailModal && (
        <ProductDetailModal
          product={showDetailModal}
          onClose={() => setShowDetailModal(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default DigitalWarehouse;