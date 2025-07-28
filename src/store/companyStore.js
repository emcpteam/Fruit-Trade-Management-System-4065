import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCompanyStore = create(
  persist(
    (set, get) => ({
      companyInfo: {
        name: '',
        vatNumber: '',
        sdiCode: '',
        address: '',
        city: '',
        postalCode: '',
        province: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        registryNumber: '',
        shareCapital: '',
        logo: null
      },

      updateCompanyInfo: (info) => {
        set({ companyInfo: { ...get().companyInfo, ...info } });
      },

      getCompanyInfo: () => {
        return get().companyInfo;
      }
    }),
    {
      name: 'company-storage'
    }
  )
);