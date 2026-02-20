import React, { useState } from 'react';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLogin: (email: string, senha: string) => Promise<void>;
  onCadastro: () => void;
}

export default function LoginView({ onLogin, onCadastro }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await onLogin(email, senha);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010409] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/30 mb-4">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">DashView</h1>
          <p className="text-gray-400">Gestão de Mídias para TV Digital</p>
        </div>

        {/* Card de Login */}
        <div className="bg-[#0d1117] rounded-2xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Entrar na sua conta</h2>

          {erro && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-red-100 text-sm">{erro}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#161b22] border border-white/10 rounded-lg 
                           text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#161b22] border border-white/10 rounded-lg 
                           text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg 
                       shadow-blue-500/20 hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0d1117] 
                       transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0d1117] text-gray-400">Não tem uma conta?</span>
            </div>
          </div>

          {/* Botão de Cadastro */}
          <button
            type="button"
            onClick={onCadastro}
            className="w-full py-3 bg-[#161b22] border border-white/10 text-white font-semibold 
                     rounded-lg hover:bg-[#1c2128] focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0d1117] 
                     transition"
          >
            Criar minha conta
          </button>

          {/* Nota sobre conta demo */}
          <div className="mt-6 p-4 bg-[#161b22] border border-white/10 rounded-lg">
            <p className="text-sm text-gray-400 text-center">
              <strong>Conta demo:</strong> admin@email.com / admin@123
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          DashView © 2024 - Sistema de Gestão de Mídias
        </p>
      </div>
    </div>
  );
}
