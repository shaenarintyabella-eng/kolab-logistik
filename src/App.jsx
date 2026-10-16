import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Barang from './pages/Barang';
import TransaksiForm from './pages/TransaksiForm';
import MasterData from './pages/MasterData';
import Laporan from './pages/Laporan';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { data } = useAppContext();
  if (!data.user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { data } = useAppContext();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={data.user ? <Navigate to="/" replace /> : <Login />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="barang" element={<Barang />} />
          <Route path="barang-masuk" element={<TransaksiForm jenis="masuk" />} />
          <Route path="barang-keluar" element={<TransaksiForm jenis="keluar" />} />
          <Route path="gudang" element={<MasterData type="gudang" />} />
          <Route path="supplier" element={<MasterData type="supplier" />} />
          <Route path="laporan" element={<Laporan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
