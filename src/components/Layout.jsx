import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, ArrowDownToLine, ArrowUpFromLine, Warehouse, Users, FileText, Settings, Search, Bell, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const menuItems = [
  { path: '/', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/barang', name: 'Barang', icon: Box },
  { path: '/barang-masuk', name: 'Barang Masuk', icon: ArrowDownToLine },
  { path: '/barang-keluar', name: 'Barang Keluar', icon: ArrowUpFromLine },
  { path: '/gudang', name: 'Gudang', icon: Warehouse },
  { path: '/supplier', name: 'Supplier', icon: Users },
  { path: '/laporan', name: 'Laporan', icon: FileText },
];

export default function Layout() {
  const location = useLocation();
  const { data, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar" style={{ padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
          <h1 style={{ color: 'var(--primary-orange)', fontSize: '2rem', fontWeight: 'bold' }}>Ko+Lab</h1>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: isActive ? 'rgba(255,138,0,0.1)' : 'transparent',
                color: isActive ? 'var(--primary-orange)' : 'var(--text-gray)',
                fontWeight: isActive ? '600' : '500'
              }}>
                <Icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>Logistik Retail & F&B</span>
          </div>
          
          <div className="search-bar">
            <Search size={18} />
            <input type="text" placeholder="Cari barang, kode, atau supplier..." />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={24} />
              <span style={{
                position: 'absolute', top: -5, right: -5,
                background: 'white', color: 'var(--primary-orange)',
                borderRadius: '50%', width: 18, height: 18,
                fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold'
              }}>2</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} color="var(--primary-orange)" />
              </div>
              <span style={{ fontWeight: '500' }}>Admin</span>
            </div>
            <button onClick={handleLogout} style={{ color: 'white' }} title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
