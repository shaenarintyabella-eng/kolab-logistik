import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Ringkasan from './pages/Ringkasan';
import MasterBarang from './pages/MasterBarang';
import InputScan from './pages/InputScan';
import ResepMenu from './pages/ResepMenu';
import RiwayatMutasi from './pages/RiwayatMutasi';
import Ketersediaan from './pages/Ketersediaan';
import MasterData from './pages/MasterData';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAppContext();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAppContext();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/ringkasan" replace /> : <Login />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/ringkasan" replace />} />
          <Route path="ringkasan" element={<Ringkasan />} />
          <Route path="barang" element={<MasterBarang />} />
          <Route path="input-scan" element={<InputScan />} />
          <Route path="resep-menu" element={<ResepMenu />} />
          <Route path="riwayat-mutasi" element={<RiwayatMutasi />} />
          <Route path="ketersediaan" element={<Ketersediaan />} />
          <Route path="gudang" element={<MasterData type="gudang" />} />
          <Route path="supplier" element={<MasterData type="supplier" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
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
