const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = { ...options.headers };
  // Jangan set 'Content-Type': 'application/json' jika body berupa FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return await response.blob();
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Terjadi kesalahan pada server');
  }

  return result;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  // Dashboard / Ringkasan
  getDashboardSummary: () => request('/dashboard/summary'),

  // Items / Master Barang
  getItems: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/items?${query}`);
  },
  getItemById: (id) => request(`/items/${id}`),
  searchItemByCode: (code) => request(`/items/search-code?code=${encodeURIComponent(code)}`),
  createItem: (formData) => request('/items', { method: 'POST', body: formData }),
  updateItem: (id, formData) => request(`/items/${id}`, { method: 'PUT', body: formData }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),

  // Mutasi Stok / Input & Scan
  createMovement: (formData) => request('/movements', { method: 'POST', body: formData }),
  getMovements: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/movements?${query}`);
  },
  exportMovementsCsv: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/movements/export-csv?${query}`);
  },

  // Resep Menu
  getMenus: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/menus?${query}`);
  },
  getMenuById: (id) => request(`/menus/${id}`),
  createMenu: (formData) => request('/menus', { method: 'POST', body: formData }),
  updateMenu: (id, formData) => request(`/menus/${id}`, { method: 'PUT', body: formData }),
  toggleMenuStatus: (id, status_manual) => request(`/menus/${id}/toggle-status`, {
    method: 'PATCH',
    body: JSON.stringify({ status_manual })
  }),
  deleteMenu: (id) => request(`/menus/${id}`, { method: 'DELETE' }),

  // Master Data (Kategori, Gudang, Supplier)
  getCategories: () => request('/master/categories'),
  getWarehouses: () => request('/master/warehouses'),
  createWarehouse: (data) => request('/master/warehouses', { method: 'POST', body: JSON.stringify(data) }),
  updateWarehouse: (id, data) => request(`/master/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWarehouse: (id) => request(`/master/warehouses/${id}`, { method: 'DELETE' }),

  getSuppliers: () => request('/master/suppliers'),
  createSupplier: (data) => request('/master/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id, data) => request(`/master/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSupplier: (id) => request(`/master/suppliers/${id}`, { method: 'DELETE' })
};

export default api;
