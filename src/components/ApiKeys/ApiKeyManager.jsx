import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useApiKeyStore } from '@/store/apiKeyStore';

const { FiKey, FiSave, FiEye, FiEyeOff, FiCheck, FiX, FiSettings } = FiIcons;

const ApiKeyManager = () => {
  const { apiKeys, updateApiKey, testApiKey } = useApiKeyStore();
  const [showKeys, setShowKeys] = useState({});
  const [testingKey, setTestingKey] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const services = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Per lettura testo dalle immagini (OCR)',
      icon: FiKey,
      color: 'bg-green-500',
      placeholder: 'sk-...',
      required: true
    },
    {
      id: 'emailjs',
      name: 'EmailJS',
      description: 'Per invio email automatiche',
      icon: FiKey,
      color: 'bg-blue-500',
      fields: [
        { key: 'serviceId', label: 'Service ID', placeholder: 'service_xxx' },
        { key: 'templateId', label: 'Template ID', placeholder: 'template_xxx' },
        { key: 'publicKey', label: 'Public Key', placeholder: 'your_public_key' }
      ],
      required: false
    },
    {
      id: 'cloudinary',
      name: 'Cloudinary',
      description: 'Per upload e gestione immagini',
      icon: FiKey,
      color: 'bg-purple-500',
      fields: [
        { key: 'cloudName', label: 'Cloud Name', placeholder: 'your_cloud_name' },
        { key: 'apiKey', label: 'API Key', placeholder: 'your_api_key' },
        { key: 'apiSecret', label: 'API Secret', placeholder: 'your_api_secret' }
      ],
      required: false
    }
  ];

  const onSubmit = async (data) => {
    try {
      for (const service of services) {
        if (service.fields) {
          const serviceData = {};
          service.fields.forEach(field => {
            if (data[`${service.id}_${field.key}`]) {
              serviceData[field.key] = data[`${service.id}_${field.key}`];
            }
          });
          if (Object.keys(serviceData).length > 0) {
            updateApiKey(service.id, serviceData);
          }
        } else {
          if (data[service.id]) {
            updateApiKey(service.id, data[service.id]);
          }
        }
      }
      toast.success('Chiavi API salvate con successo!');
    } catch (error) {
      toast.error('Errore nel salvataggio delle chiavi API');
    }
  };

  const handleTestKey = async (serviceId) => {
    setTestingKey(serviceId);
    try {
      const result = await testApiKey(serviceId);
      if (result.success) {
        toast.success(`${serviceId} API: Connessione riuscita!`);
      } else {
        toast.error(`${serviceId} API: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Errore test ${serviceId} API`);
    } finally {
      setTestingKey(null);
    }
  };

  const toggleShowKey = (serviceId) => {
    setShowKeys(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const getKeyStatus = (serviceId) => {
    const key = apiKeys[serviceId];
    if (!key) return 'not-configured';
    if (typeof key === 'object') {
      return Object.keys(key).length > 0 ? 'configured' : 'not-configured';
    }
    return key ? 'configured' : 'not-configured';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-nordic-800 flex items-center gap-2">
          <SafeIcon icon={FiSettings} className="w-8 h-8" />
          Gestione Chiavi API
        </h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Informazioni Sicurezza</h3>
        <p className="text-blue-700 text-sm">
          Le chiavi API vengono salvate localmente nel browser e non vengono inviate a server esterni. 
          Per la produzione, si consiglia di utilizzare variabili d'ambiente.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-nordic-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`${service.color} p-3 rounded-lg`}>
                  <SafeIcon icon={service.icon} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-nordic-800">
                    {service.name}
                    {service.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  <p className="text-sm text-nordic-500">{service.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  getKeyStatus(service.id) === 'configured' 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-nordic-500">
                  {getKeyStatus(service.id) === 'configured' ? 'Configurato' : 'Non configurato'}
                </span>
              </div>
            </div>

            {service.fields ? (
              // Multi-field service (EmailJS, Cloudinary)
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-nordic-700 mb-2">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        {...register(`${service.id}_${field.key}`)}
                        type={showKeys[`${service.id}_${field.key}`] ? 'text' : 'password'}
                        defaultValue={apiKeys[service.id]?.[field.key] || ''}
                        className="w-full px-4 py-3 pr-12 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                        placeholder={field.placeholder}
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey(`${service.id}_${field.key}`)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-nordic-400 hover:text-nordic-600"
                      >
                        <SafeIcon 
                          icon={showKeys[`${service.id}_${field.key}`] ? FiEyeOff : FiEye} 
                          className="w-5 h-5" 
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single field service (OpenAI)
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    {...register(service.id, service.required ? { required: `${service.name} API Key obbligatoria` } : {})}
                    type={showKeys[service.id] ? 'text' : 'password'}
                    defaultValue={apiKeys[service.id] || ''}
                    className="w-full px-4 py-3 pr-24 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder={service.placeholder}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleShowKey(service.id)}
                      className="text-nordic-400 hover:text-nordic-600"
                    >
                      <SafeIcon 
                        icon={showKeys[service.id] ? FiEyeOff : FiEye} 
                        className="w-5 h-5" 
                      />
                    </button>
                    {getKeyStatus(service.id) === 'configured' && (
                      <button
                        type="button"
                        onClick={() => handleTestKey(service.id)}
                        disabled={testingKey === service.id}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {testingKey === service.id ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <SafeIcon icon={FiCheck} className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                {errors[service.id] && (
                  <p className="text-red-500 text-sm mt-1">{errors[service.id].message}</p>
                )}
              </div>
            )}
          </motion.div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
          >
            <SafeIcon icon={FiSave} className="w-5 h-5" />
            Salva Chiavi API
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApiKeyManager;