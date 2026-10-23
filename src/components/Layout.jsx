import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ScanLine, 
  UtensilsCrossed, 
  History, 
  CheckCircle2, 
  Warehouse, 
  Truck, 
  LogOut, 
  Bell, 
  User,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Layout() {
  const { user, logout, notification, clearNotification } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
    { path: '/barang', label: 'Master Barang', icon: Package },
    { path: '/input-scan', label: 'Input & Scan', icon: ScanLine },
    { path: '/resep-menu', label: 'Resep Menu', icon: UtensilsCrossed },
    { path: '/riwayat-mutasi', label: 'Riwayat Mutasi', icon: History },
    { path: '/ketersediaan', label: 'Ketersediaan Menu', icon: CheckCircle2 },
  ];

  const subItems = [
    { path: '/gudang', label: 'Master Gudang', icon: Warehouse },
    { path: '/supplier', label: 'Master Supplier', icon: Truck },
  ];

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div className="toast-container">
          <div className={`toast ${notification.type}`}>
            {notification.type === 'success' && <Check size={18} color="#16A34A" />}
            {notification.type === 'error' && <AlertCircle size={18} color="#DC2626" />}
            {notification.type === 'info' && <Info size={18} color="#2563EB" />}
            <span>{notification.message}</span>
            <button 
              onClick={clearNotification}
              style={{ color: '#94A3B8', marginLeft: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">K+</div>
          <div className="brand-text">
            <h1>Ko+Lab Logistik</h1>
            <span>Retail & F&B Operation</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Menu Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/ringkasan' && location.pathname === '/');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div style={{ padding: '1rem 0.75rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Master Data
          </div>
          {subItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: 36, height: 36, borderRadius: '50%', background: 'var(--navy-surface)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-orange)',
                border: '1px solid rgba(255, 255, 255, 0.1)' 
              }}>
                <User size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
                  {user?.nama_lengkap || 'Administrator'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'capitalize' }}>
                  {user?.role || 'Admin Logistik'}
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              title="Keluar" 
              style={{ color: '#94A3B8', padding: '0.4rem', borderRadius: '0.375rem' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="header">
          <div className="header-title">
            <h2>Sistem Inventori Terpadu</h2>
            <span className="header-badge">MySQL Live</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              fontSize: '0.825rem', color: 'var(--text-muted)', background: '#F1F5F9',
              padding: '0.35rem 0.75rem', borderRadius: '9999px' 
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A' }}></span>
              Server Aktif (Port 5000)
            </div>

            <button 
              onClick={handleLogout} 
              className="btn btn-outline btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <LogOut size={15} /> Keluar
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
