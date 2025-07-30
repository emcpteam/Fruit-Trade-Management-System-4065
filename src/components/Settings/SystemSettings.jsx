import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import SafeIcon from '@/common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import useAuthStore from '@/store/authStore'
import ApiKeyManager from './ApiKeyManager'
import CompanySettings from './CompanySettings'
import { testSupabaseConnection } from '@/lib/supabase'

const { FiSettings, FiDatabase, FiMail, FiSmartphone, FiShield, FiSave, FiDownload, FiUpload, FiKey, FiBuilding, FiCheck, FiX, FiRefreshCw } = FiIcons

const SystemSettings = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('company')
  const [isLoading, setIsLoading] = useState(false)
  const [supabaseStatus, setSupabaseStatus] = useState(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const tabs = [
    { id: 'company', name: 'Azienda', icon: FiBuilding },
    { id: 'general', name: 'Generali', icon: FiSettings },
    { id: 'database', name: 'Database', icon: FiDatabase },
    { id: 'email', name: 'Email', icon: FiMail },
    { id: 'mobile', name: 'App Mobile', icon: FiSmartphone },
    { id: 'api-keys', name: 'API Keys', icon: FiKey },
    { id: 'security', name: 'Sicurezza', icon: FiShield }
  ]

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Impostazioni salvate con successo!')
    } catch (error) {
      toast.error('Errore nel salvataggio delle impostazioni')
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async () => {
    setIsLoading(true)
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Dati esportati con successo!')
    } catch (error) {
      toast.error('Errore nell\'esportazione dei dati')
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    setTestingConnection(true)
    try {
      const result = await testSupabaseConnection()
      setSupabaseStatus(result)
      
      if (result.success) {
        toast.success('Connessione Supabase attiva!')
      } else {
        toast.error(`Errore connessione: ${result.error}`)
      }
    } catch (error) {
      setSupabaseStatus({ success: false, error: error.message })
      toast.error('Errore nel test di connessione')
    } finally {
      setTestingConnection(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return <CompanySettings />

      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-nordic-800">Impostazioni Generali</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Nome Azienda
                </label>
                <input
                  {...register('companyName')}
                  defaultValue="Trade Management System"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Fuso Orario
                </label>
                <select
                  {...register('timezone')}
                  defaultValue="Europe/Rome"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                >
                  <option value="Europe/Rome">Europa/Roma (CET)</option>
                  <option value="Europe/London">Europa/Londra (GMT)</option>
                  <option value="America/New_York">America/New York (EST)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Valuta Predefinita
                </label>
                <select
                  {...register('currency')}
                  defaultValue="EUR"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollaro USA ($)</option>
                  <option value="GBP">Sterlina (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Lingua
                </label>
                <select
                  {...register('language')}
                  defaultValue="it"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                >
                  <option value="it">Italiano</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  {...register('enableNotifications')}
                  type="checkbox"
                  defaultChecked={true}
                  className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                />
                <span className="text-sm font-medium text-nordic-700">
                  Abilita notifiche in tempo reale
                </span>
              </label>
            </div>
          </div>
        )

      case 'database':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-nordic-800">Configurazione Database</h3>
            
            {/* Supabase Status */}
            <div className="bg-white border border-nordic-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SafeIcon icon={FiDatabase} className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-nordic-800">Stato Connessione Supabase</span>
                </div>
                <button
                  onClick={testConnection}
                  disabled={testingConnection}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <SafeIcon 
                    icon={testingConnection ? FiRefreshCw : FiCheck} 
                    className={`w-4 h-4 ${testingConnection ? 'animate-spin' : ''}`} 
                  />
                  {testingConnection ? 'Test in corso...' : 'Test Connessione'}
                </button>
              </div>

              {supabaseStatus ? (
                <div className={`p-4 rounded-lg ${supabaseStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    <SafeIcon 
                      icon={supabaseStatus.success ? FiCheck : FiX} 
                      className={`w-5 h-5 ${supabaseStatus.success ? 'text-green-600' : 'text-red-600'}`} 
                    />
                    <span className={`font-medium ${supabaseStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                      {supabaseStatus.success ? 'Connessione attiva' : 'Errore di connessione'}
                    </span>
                  </div>
                  {!supabaseStatus.success && (
                    <p className="text-red-600 text-sm mt-2">
                      {supabaseStatus.error}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 text-sm">
                    {user ? '🔄 Modalità ibrida - Dati locali con sincronizzazione Supabase' : '💾 Modalità locale - I dati sono salvati nel browser'}
                  </p>
                </div>
              )}
            </div>

            {/* Database Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  URL Supabase
                </label>
                <input
                  {...register('supabaseUrl')}
                  placeholder="https://your-project.supabase.co"
                  defaultValue="https://acilsyljzfbyimtpsfos.supabase.co"
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  readOnly
                />
                <p className="text-xs text-nordic-500 mt-1">URL del progetto Supabase configurato</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Stato Token
                </label>
                <div className="flex items-center gap-2 px-4 py-3 border border-nordic-200 rounded-lg bg-nordic-50">
                  <SafeIcon icon={FiKey} className="w-4 h-4 text-nordic-500" />
                  <span className="text-sm text-nordic-600">Token configurato</span>
                </div>
                <p className="text-xs text-nordic-500 mt-1">Chiave anonima per l'accesso pubblico</p>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-nordic-50 rounded-lg p-4">
              <h4 className="font-medium text-nordic-800 mb-3">Gestione Dati</h4>
              <div className="flex gap-4">
                <button
                  onClick={exportData}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <SafeIcon icon={FiDownload} className="w-4 h-4" />
                  )}
                  Esporta Dati
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <SafeIcon icon={FiUpload} className="w-4 h-4" />
                  Importa Dati
                </button>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <SafeIcon icon={FiDatabase} className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Informazioni Database</h4>
                  <div className="text-sm text-yellow-700 mt-1 space-y-1">
                    <p>• Il sistema funziona sia in modalità locale che con Supabase</p>
                    <p>• I dati vengono sincronizzati automaticamente quando Supabase è disponibile</p>
                    <p>• In caso di problemi di connessione, il sistema continua a funzionare localmente</p>
                    <p>• Per aggiornare le credenziali Supabase, modifica il file di configurazione</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'email':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-nordic-800">Configurazione Email</h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ Le configurazioni email sono gestite nella sezione API Keys
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  {...register('emailAutoSend')}
                  type="checkbox"
                  defaultChecked={true}
                  className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                />
                <span className="text-sm font-medium text-nordic-700">
                  Invio automatico email di conferma ordine
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  {...register('emailStatusUpdates')}
                  type="checkbox"
                  defaultChecked={true}
                  className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                />
                <span className="text-sm font-medium text-nordic-700">
                  Notifiche email per aggiornamenti stato
                </span>
              </label>
            </div>
          </div>
        )

      case 'mobile':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-nordic-800">Configurazione App Mobile</h3>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <SafeIcon icon={FiSmartphone} className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">API Mobile</span>
              </div>
              <p className="text-green-700 text-sm">
                ✅ API mobile configurate e pronte per l'integrazione con React Native
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  URL Base API
                </label>
                <input
                  {...register('apiBaseUrl')}
                  defaultValue={`${window.location.origin}/api/mobile`}
                  readOnly
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg bg-nordic-50 text-nordic-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Versione API
                </label>
                <input
                  {...register('apiVersion')}
                  defaultValue="v1.0"
                  readOnly
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg bg-nordic-50 text-nordic-600"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  {...register('mobileAutoPublish')}
                  type="checkbox"
                  defaultChecked={true}
                  className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                />
                <span className="text-sm font-medium text-nordic-700">
                  Pubblica automaticamente ordini selezionati su app mobile
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  {...register('mobileInquiries')}
                  type="checkbox"
                  defaultChecked={true}
                  className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                />
                <span className="text-sm font-medium text-nordic-700">
                  Abilita richieste da utenti app mobile
                </span>
              </label>
            </div>

            <div className="bg-nordic-50 rounded-lg p-4">
              <h4 className="font-medium text-nordic-800 mb-2">Endpoints API Disponibili:</h4>
              <ul className="text-sm text-nordic-600 space-y-1">
                <li>• <code>GET /api/mobile/orders</code> - Lista ordini pubblici</li>
                <li>• <code>GET /api/mobile/orders/:id</code> - Dettagli ordine</li>
                <li>• <code>POST /api/mobile/inquiries</code> - Invia richiesta</li>
                <li>• <code>GET /api/mobile/stats</code> - Statistiche mercato</li>
                <li>• <code>GET /api/mobile/categories</code> - Categorie prodotti</li>
              </ul>
            </div>
          </div>
        )

      case 'api-keys':
        return <ApiKeyManager />

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-nordic-800">Impostazioni Sicurezza</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Durata Sessione (ore)
                </label>
                <input
                  {...register('sessionDuration')}
                  type="number"
                  defaultValue={24}
                  min={1}
                  max={168}
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-nordic-700 mb-2">
                  Max Tentativi Login
                </label>
                <input
                  {...register('maxLoginAttempts')}
                  type="number"
                  defaultValue={5}
                  min={1}
                  max={10}
                  className="w-full px-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  {...register('requireStrongPassword')}
                  type="checkbox"
                  defaultChecked={true}
                  className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                />
                <span className="text-sm font-medium text-nordic-700">
                  Richiedi password complesse
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  {...register('enableTwoFactor')}
                  type="checkbox"
                  className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                />
                <span className="text-sm font-medium text-nordic-700">
                  Abilita autenticazione a due fattori (2FA)
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  {...register('logSecurityEvents')}
                  type="checkbox"
                  defaultChecked={true}
                  className="w-4 h-4 text-sage-600 border-nordic-300 rounded focus:ring-sage-500"
                />
                <span className="text-sm font-medium text-nordic-700">
                  Log eventi di sicurezza
                </span>
              </label>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <SafeIcon icon={FiShield} className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Sicurezza Avanzata</span>
              </div>
              <p className="text-yellow-700 text-sm">
                Per ambienti di produzione, si consiglia di implementare HTTPS, firewall e backup automatici.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-nordic-800">Impostazioni Sistema</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-sage-100 text-sage-700 border border-sage-200'
                    : 'text-nordic-600 hover:bg-nordic-50 hover:text-nordic-800'
                }`}
              >
                <SafeIcon icon={tab.icon} className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-nordic-200 p-6"
          >
            {activeTab !== 'api-keys' && activeTab !== 'company' ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                {renderTabContent()}
                <div className="mt-8 pt-6 border-t border-nordic-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <SafeIcon icon={FiSave} className="w-5 h-5" />
                    )}
                    Salva Impostazioni
                  </button>
                </div>
              </form>
            ) : (
              renderTabContent()
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings