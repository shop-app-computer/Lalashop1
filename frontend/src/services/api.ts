const API_BASE = '/api';

const fetcher = async (url: string, options: any = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
};

export const SoshopAPI = {
  auth: {
    register: (data: any) => fetcher('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (cred: any) => fetcher('/auth/login', { method: 'POST', body: JSON.stringify(cred) }),
    getMe: () => fetcher('/auth/me'),
  },
  products: {
    getAll: (q: string = '') => fetcher(`/products?${q}`),
    create: (data: any) => fetcher('/products', { method: 'POST', body: JSON.stringify(data) }),
  },
  orders: {
    create: (data: any) => fetcher('/orders', { method: 'POST', body: JSON.stringify(data) }),
    getMyOrders: () => fetcher('/orders'),
  }
};
