import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SafeIcon from '@/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useAuthStore from '@/store/authStore';

const { FiMail, FiLock, FiLogIn } = FiIcons;

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
              <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nordic-400 w-5 h-5" />
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
              <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-nordic-400 w-5 h-5" />
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

        <div className="mt-8 p-4 bg-nordic-50 rounded-lg">
          <p className="text-xs text-nordic-600 mb-2">Credenziali di test:</p>
          <p className="text-xs text-nordic-500">Admin: admin@trade.com / admin123</p>
          <p className="text-xs text-nordic-500">Segreteria: secretary@trade.com / secretary123</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;