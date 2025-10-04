import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setAuthToken, getAuthToken } from '../services/api';
import { useToast } from '../hooks/use-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Invalid token, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        const { token, user: userData } = response.data;
        
        setAuthToken(token);
        setUser(userData);
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast({
          title: 'Login realizado com sucesso!',
          description: `Bem-vindo de volta, ${userData.name}!`,
        });
        
        return { success: true };
      }
    } catch (error) {
      toast({
        title: 'Erro no login',
        description: error.message,
        variant: 'destructive'
      });
      
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { token, user: newUser } = response.data;
        
        setAuthToken(token);
        setUser(newUser);
        
        localStorage.setItem('user', JSON.stringify(newUser));
        
        toast({
          title: 'Conta criada com sucesso!',
          description: `Bem-vindo ao YOU, ${newUser.name}!`,
        });
        
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorTitle = 'Erro no cadastro';
      let errorDescription = error.message || 'Erro desconhecido';
      
      // Handle specific error cases
      if (error.status === 400) {
        errorTitle = 'Dados inválidos';
        if (error.data?.errors) {
          errorDescription = error.data.errors.map(e => e.msg).join(', ');
        } else if (error.data?.message) {
          errorDescription = error.data.message;
        }
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorTitle = 'Erro de conexão';
        errorDescription = 'Não foi possível conectar com o servidor. Verifique sua conexão.';
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive'
      });
      
      return { success: false, error: errorDescription };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      setAuthToken(null);
      localStorage.removeItem('user');
      
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;