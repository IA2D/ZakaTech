// API Client for Zeka Tech Backend
// Uses relative URL for production, localhost for development
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('auth_token') || null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.clearToken();
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Test results endpoints
  async saveTestResult(resultData) {
    return this.request('/results', {
      method: 'POST',
      body: JSON.stringify(resultData)
    });
  }

  async getMyResults() {
    return this.request('/results/my');
  }

  async getLatestResult() {
    return this.request('/results/latest');
  }

  // Admin endpoints
  async getAllUsers() {
    return this.request('/admin/users');
  }

  async deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async getAllResults() {
    return this.request('/admin/results');
  }

  async getStats() {
    return this.request('/admin/stats');
  }

  async deleteResult(resultId) {
    return this.request(`/admin/results/${resultId}`, {
      method: 'DELETE'
    });
  }
}

// Create global API client instance
const api = new ApiClient();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiClient, api };
}
