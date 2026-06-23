import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import type { User, AuthState } from '../types';
import { authService } from '../services/auth.service';

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('nesthop_token'),
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false, token: null };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem('nesthop_token', token);
    localStorage.setItem('nesthop_user', JSON.stringify(user));
    dispatch({ type: 'SET_USER', payload: { user, token } });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nesthop_token');
    localStorage.removeItem('nesthop_user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.getMe();
      if (res.success && state.token) {
        dispatch({ type: 'SET_USER', payload: { user: res.data, token: state.token } });
      }
    } catch {
      logout();
    }
  }, [state.token, logout]);

  useEffect(() => {
    const token = localStorage.getItem('nesthop_token');
    if (token) {
      authService.getMe()
        .then(res => {
          if (res.success) {
            dispatch({ type: 'SET_USER', payload: { user: res.data, token } });
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        })
        .catch(() => dispatch({ type: 'LOGOUT' }));
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }

    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);