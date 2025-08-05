import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('pharmacy_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('pharmacy_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password) // Asumiendo que tienes un campo password en la tabla
        .single();

      if (error || !data) {
        throw new Error('Credenciales inválidas');
      }

      // Guardar usuario en localStorage
      localStorage.setItem('pharmacy_user', JSON.stringify(data));
      setUser(data);

      return { user: data };
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const signOut = async () => {
    localStorage.removeItem('pharmacy_user');
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    signOut,
  };
}