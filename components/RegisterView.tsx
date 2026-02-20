import React, { useState } from 'react';
import { Building2, User, Mail, Lock, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface RegisterViewProps {
  onRegister: (nomeEmpresa: string, nomeUsuario: string, email: string, senha: string) => Promise<void>;
  onVoltar: () => void;
}

export default function RegisterView({ onRegister, onVoltar }: RegisterViewProps) {
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      await onRegister(nomeEmpresa, nomeUsuario, email, senha);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010409] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/30 mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Criar sua conta</h1>
          <p className="text-gray-400">Configure sua empresa e comece a usar o DashView</p>
        </div>

        {/* Card de Registro */}
        <div className="bg-[#0d1117] rounded-2xl p-8 shadow-2xl border border-white/10">
          <button
            onClick={onVoltar}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para login
          </button>

          {erro && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-red-100 text-sm">{erro}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações da Empresa */}
            <div className="bg-[#161b22] rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informações da Empresa
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  placeholder="Ex: Clínica Exemplo"
                  required
                  className="w-full px-4 py-3 bg-[#0d1117] border border-white/10 rounded-lg 
                           text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Este será o nome da sua conta no sistema
                </p>
              </div>
            </div>

            {/* Informações do Administrador */}
            <div className="bg-[#161b22] rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados do Administrador
              </h3>
              
              <div className="space-y-4">
                {/* Nome do Usuário */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    value={nomeUsuario}
                    onChange={(e) => setNomeUsuario(e.target.value)}
                    placeholder="Ex: João Silva"
                    required
                    className="w-full px-4 py-3 bg-[#0d1117] border border-white/10 rounded-lg 
                             text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                             focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-white/10 rounded-lg 
                               text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                               focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Senha *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-white/10 rounded-lg 
                                 text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirmar Senha *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="password"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        placeholder="Digite a senha novamente"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-[#0d1117] border border-white/10 rounded-lg 
                                 text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informação sobre o que será criado */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-100">
                  <p className="font-semibold mb-1">Ao criar sua conta, você terá:</p>
                  <ul className="list-disc list-inside space-y-1 text-green-200">
                    <li>Acesso exclusivo aos dados da sua empresa</li>
                    <li>Ambiente isolado e seguro</li>
                    <li>Permissão de administrador completo</li>
                    <li>Possibilidade de adicionar outros usuários</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Botão de Cadastro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg 
                       shadow-blue-500/20 hover:bg-blue-700 focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0d1117] 
                       transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando sua conta...' : 'Criar minha conta'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          DashView © 2024 - Sistema de Gestão de Mídias
        </p>
      </div>
    </div>
  );
}
