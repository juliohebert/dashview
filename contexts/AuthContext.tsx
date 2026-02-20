import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'admin' | 'user';
  tenantId: number;
  tenantNome: string;
  tenantSlug: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nomeEmpresa: string, nomeUsuario: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
  validateSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = window.location.hostname === 'dashview-inky.vercel.app'
  ? 'https://dashview-inky.vercel.app' 
  : `http://${window.location.host}`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar sessão do localStorage ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('dashview_token');
    const storedUser = localStorage.getItem('dashview_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUser));
      // Validar sessão no servidor
      validateSession().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao fazer login');
    }

    const data = await response.json();
    
    // Salvar no estado e localStorage
    setToken(data.token);
    setUsuario(data.usuario);
    localStorage.setItem('dashview_token', data.token);
    localStorage.setItem('dashview_user', JSON.stringify(data.usuario));
  };

  const register = async (nomeEmpresa: string, nomeUsuario: string, email: string, senha: string) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomeEmpresa, nomeUsuario, email, senha })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao criar conta');
    }

    const data = await response.json();
    
    // Salvar no estado e localStorage
    setToken(data.token);
    setUsuario(data.usuario);
    localStorage.setItem('dashview_token', data.token);
    localStorage.setItem('dashview_user', JSON.stringify(data.usuario));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('dashview_token');
    localStorage.removeItem('dashview_user');
  };

  const validateSession = async (): Promise<boolean> => {
    const storedToken = token || localStorage.getItem('dashview_token');
    
    if (!storedToken) {
      logout();
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/validate`, {
        headers: { 
          'Authorization': `Bearer ${storedToken}` 
        }
      });

      if (!response.ok) {
        logout();
        return false;
      }

      const data = await response.json();
      setUsuario(data.usuario);
      localStorage.setItem('dashview_user', JSON.stringify(data.usuario));
      return true;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        usuario,
        token,
        isAuthenticated: !!token && !!usuario,
        loading,
        login,
        register,
        logout,
        validateSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
