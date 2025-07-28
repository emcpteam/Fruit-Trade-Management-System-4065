import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSuggestionStore = create(
  persist(
    (set, get) => ({
      suggestions: [
        // Default suggestions for products
        {
          id: 1,
          category: 'product',
          value: 'CIPOLLE DORATE PRECOCI VARIETA\' TELESTO',
          description: 'Cipolle dorate precoci di alta qualità',
          usage: 15,
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          category: 'product',
          value: 'POMODORI SAN MARZANO DOP',
          description: 'Pomodori San Marzano certificati DOP',
          usage: 12,
          isActive: true,
          createdAt: '2024-01-16T11:00:00Z'
        },
        {
          id: 3,
          category: 'product',
          value: 'ZUCCHINE BIOLOGICHE',
          description: 'Zucchine certificate biologiche',
          usage: 8,
          isActive: true,
          createdAt: '2024-01-17T12:00:00Z'
        },
        
        // Default suggestions for types
        {
          id: 4,
          category: 'type',
          value: 'SGAMBATE, SELEZIONATE E CALIBRATE 40/60 MM',
          description: 'Tipologia standard per cipolle',
          usage: 10,
          isActive: true,
          createdAt: '2024-01-18T13:00:00Z'
        },
        {
          id: 5,
          category: 'type',
          value: 'EXTRA CLASSE I',
          description: 'Classificazione europea per qualità superiore',
          usage: 8,
          isActive: true,
          createdAt: '2024-01-19T14:00:00Z'
        },
        {
          id: 6,
          category: 'type',
          value: 'BIOLOGICO CERTIFICATO',
          description: 'Prodotto con certificazione biologica',
          usage: 6,
          isActive: true,
          createdAt: '2024-01-20T15:00:00Z'
        },

        // Default suggestions for packaging
        {
          id: 7,
          category: 'packaging',
          value: 'BINS COMPRATORE TARA REALE',
          description: 'Contenitori standard del compratore',
          usage: 12,
          isActive: true,
          createdAt: '2024-01-21T16:00:00Z'
        },
        {
          id: 8,
          category: 'packaging',
          value: 'SACCHI DA 25 KG',
          description: 'Sacchi standard da 25 chilogrammi',
          usage: 9,
          isActive: true,
          createdAt: '2024-01-22T17:00:00Z'
        },
        {
          id: 9,
          category: 'packaging',
          value: 'CASSETTE IN LEGNO',
          description: 'Cassette in legno per prodotti delicati',
          usage: 7,
          isActive: true,
          createdAt: '2024-01-23T18:00:00Z'
        },

        // Default suggestions for origins
        {
          id: 10,
          category: 'origin',
          value: 'ITALIA (VENETO)',
          description: 'Prodotto italiano della regione Veneto',
          usage: 15,
          isActive: true,
          createdAt: '2024-01-24T19:00:00Z'
        },
        {
          id: 11,
          category: 'origin',
          value: 'ITALIA (CAMPANIA)',
          description: 'Prodotto italiano della regione Campania',
          usage: 11,
          isActive: true,
          createdAt: '2024-01-25T20:00:00Z'
        },
        {
          id: 12,
          category: 'origin',
          value: 'ITALIA (SICILIA)',
          description: 'Prodotto italiano della regione Sicilia',
          usage: 9,
          isActive: true,
          createdAt: '2024-01-26T21:00:00Z'
        },

        // Default suggestions for quantities
        {
          id: 13,
          category: 'quantity',
          value: '2,5 AUTOTRENI',
          description: 'Quantità standard per grandi ordini',
          usage: 8,
          isActive: true,
          createdAt: '2024-01-27T22:00:00Z'
        },
        {
          id: 14,
          category: 'quantity',
          value: '1 AUTOTRENO',
          description: 'Quantità per ordini medi',
          usage: 12,
          isActive: true,
          createdAt: '2024-01-28T23:00:00Z'
        },
        {
          id: 15,
          category: 'quantity',
          value: '500 QUINTALI',
          description: 'Quantità in quintali',
          usage: 6,
          isActive: true,
          createdAt: '2024-01-29T10:00:00Z'
        }
      ],

      addSuggestion: (suggestion) => {
        const newSuggestion = {
          ...suggestion,
          id: Date.now(),
          usage: 0,
          createdAt: new Date().toISOString()
        };
        set(state => ({
          suggestions: [...state.suggestions, newSuggestion]
        }));
        return newSuggestion;
      },

      updateSuggestion: (id, updates) => {
        set(state => ({
          suggestions: state.suggestions.map(suggestion =>
            suggestion.id === id ? { ...suggestion, ...updates } : suggestion
          )
        }));
      },

      deleteSuggestion: (id) => {
        set(state => ({
          suggestions: state.suggestions.filter(suggestion => suggestion.id !== id)
        }));
      },

      incrementUsage: (id) => {
        set(state => ({
          suggestions: state.suggestions.map(suggestion =>
            suggestion.id === id 
              ? { ...suggestion, usage: suggestion.usage + 1 }
              : suggestion
          )
        }));
      },

      getSuggestionsByCategory: (category) => {
        const { suggestions } = get();
        return suggestions
          .filter(s => s.category === category && s.isActive)
          .sort((a, b) => b.usage - a.usage);
      },

      searchSuggestions: (category, query) => {
        const { suggestions } = get();
        if (!query) return get().getSuggestionsByCategory(category);
        
        return suggestions
          .filter(s => 
            s.category === category && 
            s.isActive &&
            s.value.toLowerCase().includes(query.toLowerCase())
          )
          .sort((a, b) => b.usage - a.usage);
      }
    }),
    {
      name: 'suggestion-storage'
    }
  )
);