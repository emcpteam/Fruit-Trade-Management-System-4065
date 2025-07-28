import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useApiKeyStore = create(
  persist(
    (set, get) => ({
      apiKeys: {},

      updateApiKey: (service, key) => {
        set(state => ({
          apiKeys: {
            ...state.apiKeys,
            [service]: key
          }
        }));
      },

      getApiKey: (service) => {
        return get().apiKeys[service];
      },

      testApiKey: async (service) => {
        const keys = get().apiKeys;
        const key = keys[service];

        if (!key) {
          return { success: false, error: 'Chiave API non configurata' };
        }

        try {
          switch (service) {
            case 'openai':
              // Test OpenAI API
              const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                  'Authorization': `Bearer ${key}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (response.ok) {
                return { success: true };
              } else {
                return { success: false, error: 'Chiave API non valida' };
              }

            case 'emailjs':
              // Test EmailJS (basic validation)
              if (key.serviceId && key.templateId && key.publicKey) {
                return { success: true };
              } else {
                return { success: false, error: 'Configurazione incompleta' };
              }

            case 'cloudinary':
              // Test Cloudinary (basic validation)
              if (key.cloudName && key.apiKey && key.apiSecret) {
                return { success: true };
              } else {
                return { success: false, error: 'Configurazione incompleta' };
              }

            default:
              return { success: false, error: 'Servizio non supportato' };
          }
        } catch (error) {
          return { success: false, error: 'Errore di connessione' };
        }
      },

      isConfigured: (service) => {
        const key = get().apiKeys[service];
        if (!key) return false;
        
        if (typeof key === 'object') {
          return Object.keys(key).length > 0 && Object.values(key).every(v => v);
        }
        
        return !!key;
      }
    }),
    {
      name: 'api-keys-storage'
    }
  )
);