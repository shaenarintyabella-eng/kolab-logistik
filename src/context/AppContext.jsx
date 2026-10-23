import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('kolab_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [notification, setNotification] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(prev => (prev?.id === Date.now() ? null : prev));
    }, 4000);
  };

  const login = async (username, password) => {
    try {
      const res = await api.login({ username, password });
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('kolab_user', JSON.stringify(res.user));
        showNotification(`Selamat datang kembali, ${res.user.nama_lengkap}!`, 'success');
        return { success: true };
      }
      return { success: false, message: res.message || 'Login gagal' };
    } catch (err) {
      return { success: false, message: err.message || 'Gagal menghubungi server database' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kolab_user');
    showNotification('Anda telah berhasil keluar.', 'info');
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      notification,
      showNotification,
      clearNotification: () => setNotification(null),
      refreshKey,
      triggerRefresh
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
