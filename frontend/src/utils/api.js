const API_BASE = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('token');

const request = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  let response;
  try {
    response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers
    });
  } catch (error) {
    throw new Error('无法连接后端服务，请先启动 backend：npm start');
  }
  
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }
  
  return response;
};

const requestFile = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  let response;
  try {
    response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers
    });
  } catch (error) {
    throw new Error('无法连接后端服务，请先启动 backend：npm start');
  }
  
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }
  
  return response;
};

export const api = {
  auth: {
    login: (username, password) => 
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      }),
    getCurrentUser: () => request('/auth/me'),
    getMenus: () => request('/auth/menus')
  },
  
  stats: {
    getDashboard: () => request('/stats/dashboard')
  },
  
  dashboard: {
    getFullData: () => request('/dashboard/full'),
    getAlerts: () => request('/dashboard/alerts'),
    getTeamPerformance: () => request('/dashboard/team-performance'),
    getDealNews: () => request('/dashboard/deal-news'),
    getHighPotentialCustomers: () => request('/dashboard/high-potential-customers'),
    getMarketingTips: () => request('/dashboard/marketing-tips'),
    getSalesForecast: () => request('/dashboard/sales-forecast')
  },

  reports: {
    get: (period = 'month') => request(`/reports?period=${period}`)
  },

  ai: {
    getInsights: () => request('/ai/insights'),
    analyze: (data) => request('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  audio: {
    upload: ({ customerId, file, transcript = '', metadata = {} }) => {
      if (file) {
        return requestFile(`/audio/upload?customer_id=${customerId}`, {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'X-Customer-Id': String(customerId),
            'X-File-Name': file.name || 'call-recording.bin',
            'X-Duration-Seconds': String(metadata.duration_seconds || 0)
          },
          body: file
        });
      }

      return request('/audio/upload', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: customerId,
          transcript,
          metadata
        })
      });
    },
    getJob: (jobId) => request(`/audio/jobs/${jobId}`)
  },
  
  leads: {
    getAll: (page = 1, limit = 10) => request(`/leads?page=${page}&limit=${limit}`),
    getById: (id) => request(`/leads/${id}`),
    create: (data) => request('/leads', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/leads/${id}`, {
      method: 'DELETE'
    }),
    analyze: (data) => request('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  
  customers: {
    getAll: (page = 1, limit = 10) => request(`/customers?page=${page}&limit=${limit}`),
    getById: (id) => request(`/customers/${id}`),
    getAiInsights: (id) => request(`/customers/${id}/ai-insights`),
    create: (data) => request('/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/customers/${id}`, {
      method: 'DELETE'
    })
  },
  
  quotes: {
    getAll: (page = 1, limit = 10) => request(`/quotes?page=${page}&limit=${limit}`),
    getById: (id) => request(`/quotes/${id}`),
    create: (data) => request('/quotes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/quotes/${id}`, {
      method: 'DELETE'
    })
  },
  
  contracts: {
    getAll: (page = 1, limit = 10) => request(`/contracts?page=${page}&limit=${limit}`),
    getById: (id) => request(`/contracts/${id}`),
    create: (data) => request('/contracts', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id) => request(`/contracts/${id}`, {
      method: 'DELETE'
    })
  },
  
  export: {
    exportData: (resource) => requestFile(`/export/${resource}`, {
      method: 'POST'
    })
  }
};
