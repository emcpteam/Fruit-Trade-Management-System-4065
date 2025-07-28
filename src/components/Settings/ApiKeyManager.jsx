import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ocrService from '@/utils/ocrService';

const { FiKey, FiSave, FiEye, FiEyeOff, FiCheck, FiX, FiExternalLink } = FiIcons;

const ApiKeyManager = () => {
  const [showKeys, setShowKeys] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm();

  const apiServices = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Per OCR e analisi immagini con GPT-4 Vision',
      placeholder: 'sk-...',
      website: 'https://platform.openai.com/api-keys',
      currentValue: ocrService.getApiKey(),
      testEndpoint: 'https://api.openai.com/v1/models'
    },
    {
      id: 'emailjs',
      name: 'EmailJS',
      description: 'Per invio email automatiche',
      placeholder: 'user_...',
      website: 'https://dashboard.emailjs.com/admin',
      currentValue: localStorage.getItem('emailjs_public_key'),
      fields: [
        { key: 'service_id', label: 'Service ID', placeholder: 'service_...' },
        { key: 'template_id', label: 'Template ID', placeholder: 'template_...' },
        { key: 'public_key', label: 'Public Key', placeholder: 'user_...' }
      ]
    },
    {
      id: 'google_maps',
      name: 'Google Maps',
      description: 'Per geocoding e mappe interattive',
      placeholder: 'AIza...',
      website: 'https://console.cloud.google.com/google/maps-apis',
      currentValue: localStorage.getItem('google_maps_api_key')
    }
  ];

  React.useEffect(() => {
    // Load current values
    apiServices.forEach(service => {
      if (service.fields) {
        service.fields.forEach(field => {
          const value = localStorage.getItem(`${service.id}_${field.key}`);
          if (value) {
            setValue(`${service.id}_${field.key}`, value);
          }
        });
      } else if (service.currentValue) {
        setValue(service.id, service.currentValue);
      }
    });
  }, [setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Save all API keys
      Object.entries(data).forEach(([key, value]) => {
        if (value && value.trim()) {
          if (key === 'openai') {
            ocrService.setApiKey(value.trim());
          } else {
            localStorage.setItem(`${key}`, value.trim());
          }
        }
      });

      toast.success('Chiavi API salvate con successo!');
    } catch (error) {
      toast.error('Errore nel salvataggio delle chiavi API');
    } finally {
      setIsLoading(false);
    }
  };

  const testApiKey = async (service) => {
    const apiKey = watch(service.id);
    if (!apiKey || !service.testEndpoint) {
      toast.error('Inserisci una chiave API valida');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(service.testEndpoint, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(`${service.name}: Connessione riuscita!`);
      } else {
        toast.error(`${service.name}: Chiave API non valida`);
      }
    } catch (error) {
      toast.error(`${service.name}: Errore di connessione`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowKey = (serviceId) => {
    setShowKeys(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const clearApiKey = (service) => {
    if (service.fields) {
      service.fields.forEach(field => {
        setValue(`${service.id}_${field.key}`, '');
        localStorage.removeItem(`${service.id}_${field.key}`);
      });
    } else {
      setValue(service.id, '');
      if (service.id === 'openai') {
        ocrService.setApiKey('');
      } else {
        localStorage.removeItem(service.id);
      }
    }
    toast.success(`${service.name}: Chiave rimossa`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-nordic-800">Configurazione API Keys</h2>
          <p className="text-sm text-nordic-500 mt-1">
            Configura le chiavi API per abilitare le funzionalità avanzate
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {apiServices.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-nordic-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiKey} className="w-5 h-5 text-sage-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-nordic-800">{service.name}</h3>
                  <p className="text-sm text-nordic-500">{service.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {service.currentValue && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <SafeIcon icon={FiCheck} className="w-4 h-4" />
                    Configurato
                  </div>
                )}
                <a
                  href={service.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-nordic-600 hover:bg-nordic-100 rounded-lg transition-colors"
                  title="Vai al sito ufficiale"
                >
                  <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                </a>
              </div>
            </div>

            {service.fields ? (
              // Multiple fields (like EmailJS)
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
                        className="w-full px-4 py-3 pr-20 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                        placeholder={field.placeholder}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleShowKey(`${service.id}_${field.key}`)}
                          className="p-1 text-nordic-400 hover:text-nordic-600"
                        >
                          <SafeIcon icon={showKeys[`${service.id}_${field.key}`] ? FiEyeOff : FiEye} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single field
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    {...register(service.id)}
                    type={showKeys[service.id] ? 'text' : 'password'}
                    className="w-full px-4 py-3 pr-32 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    placeholder={service.placeholder}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleShowKey(service.id)}
                      className="p-1 text-nordic-400 hover:text-nordic-600"
                    >
                      <SafeIcon icon={showKeys[service.id] ? FiEyeOff : FiEye} className="w-4 h-4" />
                    </button>
                    {service.testEndpoint && (
                      <button
                        type="button"
                        onClick={() => testApiKey(service)}
                        disabled={isLoading}
                        className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        title="Testa connessione"
                      >
                        <SafeIcon icon={FiCheck} className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => clearApiKey(service)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Rimuovi chiave"
                    >
                      <SafeIcon icon={FiX} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Service specific instructions */}
            <div className="mt-4 p-3 bg-nordic-50 rounded-lg">
              <h4 className="text-sm font-medium text-nordic-800 mb-2">Come ottenere la chiave:</h4>
              <div className="text-sm text-nordic-600 space-y-1">
                {service.id === 'openai' && (
                  <>
                    <p>1. Vai su <a href={service.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a></p>
                    <p>2. Crea un account o effettua il login</p>
                    <p>3. Vai in "API keys" e crea una nuova chiave</p>
                    <p>4. Assicurati di avere crediti sufficienti per usare GPT-4 Vision</p>
                  </>
                )}
                {service.id === 'emailjs' && (
                  <>
                    <p>1. Registrati su <a href={service.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">EmailJS</a></p>
                    <p>2. Crea un servizio email (Gmail, Outlook, etc.)</p>
                    <p>3. Crea un template per le email</p>
                    <p>4. Copia Service ID, Template ID e Public Key</p>
                  </>
                )}
                {service.id === 'google_maps' && (
                  <>
                    <p>1. Vai su <a href={service.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></p>
                    <p>2. Crea un progetto e abilita Maps JavaScript API</p>
                    <p>3. Vai in "Credenziali" e crea una API key</p>
                    <p>4. Limita la chiave ai domini autorizzati</p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SafeIcon icon={FiSave} className="w-5 h-5" />
            )}
            Salva Configurazione
          </button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <SafeIcon icon={FiKey} className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Sicurezza delle API Keys</h4>
            <div className="text-sm text-yellow-700 mt-1 space-y-1">
              <p>• Le chiavi API sono memorizzate localmente nel tuo browser</p>
              <p>• Non condividere mai le tue chiavi API con altri</p>
              <p>• Monitora l'utilizzo delle API sui rispettivi portali</p>
              <p>• Rinnova periodicamente le chiavi per maggiore sicurezza</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;