import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useAuthStore from '@/store/authStore';

const { FiMail, FiLock, FiLogIn, FiInfo } = FiIcons;

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success('Login effettuato con successo!');
      } else {
        toast.error(result.error || 'Errore durante il login');
      }
    } catch (error) {
      toast.error('Errore di connessione');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (email, password) => {
    setIsLoading(true);
    login(email, password).then(result => {
      if (result.success) {
        toast.success('Login effettuato con successo!');
      } else {
        toast.error(result.error || 'Errore durante il login');
      }
      setIsLoading(false);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-nordic-800 mb-2">Trade Manager</h1>
          <p className="text-nordic-500">Sistema di gestione ordini</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-nordic-700 mb-2">
              Email
            </label>
            <div className="relative">
              <SafeIcon 
                icon={FiMail} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nordic-400 w-5 h-5" 
              />
              <input
                {...register('email', {
                  required: 'Email obbligatoria',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email non valida'
                  }
                })}
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="Inserisci la tua email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-nordic-700 mb-2">
              Password
            </label>
            <div className="relative">
              <SafeIcon 
                icon={FiLock} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nordic-400 w-5 h-5" 
              />
              <input
                {...register('password', { required: 'Password obbligatoria' })}
                type="password"
                className="w-full pl-10 pr-4 py-3 border border-nordic-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                placeholder="Inserisci la password"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-sage-600 text-white py-3 rounded-lg font-medium hover:bg-sage-700 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <SafeIcon icon={FiLogIn} className="w-5 h-5" />
                Accedi
              </>
            )}
          </motion.button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-nordic-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <SafeIcon icon={FiInfo} className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-medium text-nordic-700">Credenziali Demo</p>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => quickLogin('admin@trade.com', 'admin123')}
              disabled={isLoading}
              className="w-full text-left p-2 rounded border border-nordic-200 hover:bg-white transition-colors disabled:opacity-50"
            >
              <div className="text-xs font-medium text-nordic-700">👨‍💼 Amministratore</div>
              <div className="text-xs text-nordic-500">admin@trade.com / admin123</div>
            </button>
            
            <button
              onClick={() => quickLogin('secretary@trade.com', 'secretary123')}
              disabled={isLoading}
              className="w-full text-left p-2 rounded border border-nordic-200 hover:bg-white transition-colors disabled:opacity-50"
            >
              <div className="text-xs font-medium text-nordic-700">👩‍💼 Manager</div>
              <div className="text-xs text-nordic-500">secretary@trade.com / secretary123</div>
            </button>
            
            <button
              onClick={() => quickLogin('mobile@trade.com', 'mobile123')}
              disabled={isLoading}
              className="w-full text-left p-2 rounded border border-nordic-200 hover:bg-white transition-colors disabled:opacity-50"
            >
              <div className="text-xs font-medium text-nordic-700">📱 Utente Mobile</div>
              <div className="text-xs text-nordic-500">mobile@trade.com / mobile123</div>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Sistema Online - Modalità Demo
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;