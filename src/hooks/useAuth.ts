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
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('pharmacy_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Use the custom authentication function
      const { data, error } = await supabase
        .rpc('authenticate_user', {
          user_email: email,
          user_password: password
        });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        throw new Error('Credenciales inválidas');
      }

      const userData = data[0];
      
      // Store user in localStorage
      localStorage.setItem('pharmacy_user', JSON.stringify(userData));
      
      // Update state immediately
      setUser(userData);

      return { user: userData };
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // First, hash the password using the database function
      const { data: hashData, error: hashError } = await supabase
        .rpc('hash_password', { password });

      if (hashError) {
        throw new Error('Error al procesar la contraseña');
      }

      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          full_name: fullName,
          password_hash: hashData,
          role: 'cashier',
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Store user in localStorage
      localStorage.setItem('pharmacy_user', JSON.stringify(data));
      setUser(data);

      return { user: data };
    } catch (error: any) {
      throw new Error(error.message || 'Error al registrarse');
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('pharmacy_user');
      setUser(null);
      // Force a page reload to clear any cached state
      window.location.reload();
    } catch (error: any) {
      throw new Error(error.message || 'Error al cerrar sesión');
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Update localStorage and state
      localStorage.setItem('pharmacy_user', JSON.stringify(data));
      setUser(data);

      return { user: data };
    } catch (error: any) {
      throw new Error(error.message || 'Error al actualizar perfil');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Verify current password
      const { data: verifyData, error: verifyError } = await supabase
        .rpc('authenticate_user', {
          user_email: user.email,
          user_password: currentPassword
        });

      if (verifyError || !verifyData || verifyData.length === 0) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hash new password
      const { data: hashData, error: hashError } = await supabase
        .rpc('hash_password', { password: newPassword });

      if (hashError) {
        throw new Error('Error al procesar la nueva contraseña');
      }

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: hashData })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Error al cambiar contraseña');
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
  };
}