import { useState } from 'react';
import { X, Cloud, LogOut, RefreshCw } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function AuthModal({ isOpen, onClose, user, syncStatus, onSyncNow }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return setMessage('Supabase não configurado.');
    setLoading(true);
    setMessage('');

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else if (isSignUp) {
      setMessage('Conta criada! Verifique seu e-mail (ou faça login se a confirmação estiver desativada).');
    } else {
      onClose();
    }
  };

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <Cloud size={20} className="text-blue-500" />
            <span>Nuvem</span>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-xl text-sm">
              <div className="text-gray-400 text-xs">Conectado como</div>
              <div className="font-medium text-gray-800 truncate">{user.email}</div>
              <div className="text-xs text-blue-600 mt-1">Status: {syncStatus}</div>
            </div>

            <button
              onClick={onSyncNow}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium text-sm"
            >
              <RefreshCw size={16} /> Sincronizar agora
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium text-sm"
            >
              <LogOut size={16} /> Sair da conta
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha (mín. 6 caracteres)"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
            />

            {message && <div className="text-xs text-red-500">{message}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium text-sm disabled:opacity-50"
            >
              {loading ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
              className="w-full text-xs text-gray-500 hover:text-blue-600 pt-1"
            >
              {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar agora'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}