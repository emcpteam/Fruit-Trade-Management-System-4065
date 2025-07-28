import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCompanyStore } from '@/store/companyStore';

const { FiBuilding, FiSave, FiUpload, FiImage, FiX } = FiIcons;

const CompanySettings = () => {
  const { companyInfo, updateCompanyInfo } = useCompanyStore();
  const [logoPreview, setLogoPreview] = useState(companyInfo.logo || null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: companyInfo
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const updatedInfo = {
        ...data,
        logo: logoPreview
      };
      
      updateCompanyInfo(updatedInfo);
      toast.success('Informazioni aziendali aggiornate con successo!');
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setLogoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Seleziona un file immagine valido');
      }
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500 p-3 rounded-lg">
          <SafeIcon icon={FiBuilding} className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-nordic-800">Informazioni Aziendali</h3>
          <p className="text-sm text-nordic-500">
            Configura le informazioni che appariranno sui documenti generati
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo Section */}
        <div className="bg-white rounded-xl border border-nordic-200 p-6">
          <h4 className="text-md font-semibold text-nordic-800 mb-4">Logo Aziendale</h4>
          
          <div className="flex items-start gap-6">
            {/* Logo Preview */}
            <div className="flex-shrink-0">
              {logoPreview ? (
                <div className="relative">
                  <img 
                    src={logoPreview} 
                    alt="Logo aziendale" 
                    className="w-32 h-32 object-contain border border-nordic-200 rounded-lg bg-white p-2"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <SafeIcon icon={FiX} className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-nordic-300 rounded-lg flex items-center justify-center bg-nordic-50">
                  <div className="text-center">
                    <SafeIcon icon={FiImage} className="w-8 h-8 text-nordic-400 mx-auto mb-2" />
                    <p className="text-xs text-nordic-500">Nessun logo</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                  <SafeIcon icon={FiUpload} className="w-4 h-4" />
                  {logoPreview ? 'Cambia Logo' : 'Carica Logo'}
                </div>
              </label>
              <p className="text-xs text-nordic-500 mt-2">
                Formati supportati: PNG, JPG, SVG. Dimensione consigliata: 200x200px
              </p>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-xl border border-nordic-200 p-6">
          <h4 className="text-md font-semibold text-nordic-800 mb-4">Dati Aziendali</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
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
                Codice SDI
              </label>
              <input
                {...register('sdiCode')}
                type="text"
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="Codice destinatario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                Indirizzo *
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
                placeholder="Città"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                CAP *
              </label>
              <input
                {...register('postalCode', { required: 'CAP obbligatorio' })}
                type="text"
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="00000"
              />
              {errors.postalCode && (
                <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                Provincia
              </label>
              <input
                {...register('province')}
                type="text"
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="PR"
                maxLength={2}
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
                placeholder="info@azienda.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                Sito Web
              </label>
              <input
                {...register('website')}
                type="url"
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="https://www.azienda.com"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl border border-nordic-200 p-6">
          <h4 className="text-md font-semibold text-nordic-800 mb-4">Informazioni Aggiuntive</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nordic-700 mb-2">
                Descrizione Attività
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="Breve descrizione dell'attività aziendale..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Registro Imprese
                </label>
                <input
                  {...register('registryNumber')}
                  type="text"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="Numero registro imprese"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Capitale Sociale
                </label>
                <input
                  {...register('shareCapital')}
                  type="text"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  placeholder="es. €10.000,00 i.v."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-sage-600 text-white px-6 py-3 rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SafeIcon icon={FiSave} className="w-5 h-5" />
            )}
            Salva Informazioni
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CompanySettings;