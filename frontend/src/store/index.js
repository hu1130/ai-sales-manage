import { createStore } from 'vuex';
import { api } from '../utils/api';

const store = createStore({
  state: {
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    roles: JSON.parse(localStorage.getItem('roles') || '[]'),
    permissions: JSON.parse(localStorage.getItem('permissions') || '[]'),
    menus: JSON.parse(localStorage.getItem('menus') || '[]'),
    
    leads: [],
    leadsTotal: 0,
    
    customers: [],
    customersTotal: 0,
    
    quotes: [],
    quotesTotal: 0,
    
    contracts: [],
    contractsTotal: 0,
    
    dashboardStats: null,
    dashboardAlerts: [],
    dashboardTeamPerformance: [],
    dashboardDealNews: [],
    dashboardHighPotentialCustomers: [],
    dashboardMarketingTips: [],
    dashboardSalesForecast: []
  },
  
  mutations: {
    SET_AUTH(state, { token, user, roles, permissions, menus }) {
      state.token = token;
      state.user = user;
      state.roles = roles;
      state.permissions = permissions;
      state.menus = menus;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('roles', JSON.stringify(roles));
      localStorage.setItem('permissions', JSON.stringify(permissions));
      localStorage.setItem('menus', JSON.stringify(menus));
    },
    
    CLEAR_AUTH(state) {
      state.token = '';
      state.user = null;
      state.roles = [];
      state.permissions = [];
      state.menus = [];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('roles');
      localStorage.removeItem('permissions');
      localStorage.removeItem('menus');
    },
    
    SET_MENUS(state, menus) {
      state.menus = menus;
      localStorage.setItem('menus', JSON.stringify(menus));
    },
    
    SET_LEADS(state, { data, total }) {
      state.leads = data;
      state.leadsTotal = total;
    },
    
    ADD_LEAD(state, lead) {
      state.leads.unshift(lead);
      state.leadsTotal++;
    },
    
    UPDATE_LEAD(state, updatedLead) {
      const index = state.leads.findIndex(lead => lead.id === updatedLead.id);
      if (index !== -1) {
        state.leads.splice(index, 1, updatedLead);
      }
    },
    
    DELETE_LEAD(state, leadId) {
      state.leads = state.leads.filter(lead => lead.id !== leadId);
      state.leadsTotal--;
    },
    
    SET_CUSTOMERS(state, { data, total }) {
      state.customers = data;
      state.customersTotal = total;
    },
    
    ADD_CUSTOMER(state, customer) {
      state.customers.unshift(customer);
      state.customersTotal++;
    },
    
    UPDATE_CUSTOMER(state, updatedCustomer) {
      const index = state.customers.findIndex(customer => customer.id === updatedCustomer.id);
      if (index !== -1) {
        state.customers.splice(index, 1, updatedCustomer);
      }
    },
    
    DELETE_CUSTOMER(state, customerId) {
      state.customers = state.customers.filter(customer => customer.id !== customerId);
      state.customersTotal--;
    },
    
    SET_QUOTES(state, { data, total }) {
      state.quotes = data;
      state.quotesTotal = total;
    },
    
    ADD_QUOTE(state, quote) {
      state.quotes.unshift(quote);
      state.quotesTotal++;
    },
    
    UPDATE_QUOTE(state, updatedQuote) {
      const index = state.quotes.findIndex(quote => quote.id === updatedQuote.id);
      if (index !== -1) {
        state.quotes.splice(index, 1, updatedQuote);
      }
    },
    
    DELETE_QUOTE(state, quoteId) {
      state.quotes = state.quotes.filter(quote => quote.id !== quoteId);
      state.quotesTotal--;
    },
    
    SET_CONTRACTS(state, { data, total }) {
      state.contracts = data;
      state.contractsTotal = total;
    },
    
    ADD_CONTRACT(state, contract) {
      state.contracts.unshift(contract);
      state.contractsTotal++;
    },
    
    UPDATE_CONTRACT(state, updatedContract) {
      const index = state.contracts.findIndex(contract => contract.id === updatedContract.id);
      if (index !== -1) {
        state.contracts.splice(index, 1, updatedContract);
      }
    },
    
    DELETE_CONTRACT(state, contractId) {
      state.contracts = state.contracts.filter(contract => contract.id !== contractId);
      state.contractsTotal--;
    },
    
    SET_DASHBOARD_STATS(state, stats) {
      state.dashboardStats = stats;
    },
    
    SET_DASHBOARD_ALERTS(state, alerts) {
      state.dashboardAlerts = alerts;
    },
    
    SET_DASHBOARD_TEAM_PERFORMANCE(state, teamPerformance) {
      state.dashboardTeamPerformance = teamPerformance;
    },
    
    SET_DASHBOARD_DEAL_NEWS(state, dealNews) {
      state.dashboardDealNews = dealNews;
    },
    
    SET_DASHBOARD_HIGH_POTENTIAL_CUSTOMERS(state, customers) {
      state.dashboardHighPotentialCustomers = customers;
    },
    
    SET_DASHBOARD_MARKETING_TIPS(state, tips) {
      state.dashboardMarketingTips = tips;
    },
    
    SET_DASHBOARD_SALES_FORECAST(state, forecast) {
      state.dashboardSalesForecast = forecast;
    },
    
    SET_FULL_DASHBOARD_DATA(state, data) {
      state.dashboardStats = data.stats;
      state.dashboardAlerts = data.reminders;
      state.dashboardTeamPerformance = data.teamPerformance;
      state.dashboardDealNews = data.dealNews;
      state.dashboardHighPotentialCustomers = data.highPotentialCustomers;
      state.dashboardMarketingTips = data.marketingTips;
      state.dashboardSalesForecast = data.salesForecast;
    }
  },
  
  actions: {
    async login({ commit }, { username, password }) {
      const response = await api.auth.login(username, password);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '登录失败');
      }
      const data = await response.json();
      commit('SET_AUTH', { 
        token: data.token, 
        user: data.user,
        roles: data.roles,
        permissions: data.permissions,
        menus: data.menus
      });
      return data;
    },
    
    async fetchMenus({ commit, dispatch }) {
      // 不管有没有旧数据，都要从后端重新获取最新菜单
      try {
        const response = await api.auth.getMenus();
        
        // 检查响应是否成功
        if (!response) {
          // 响应为 null，说明 401 已经被处理，直接返回
          return [];
        }
        
        if (!response.ok) {
          if (response.status === 401) {
            dispatch('logout');
            return [];
          }
          throw new Error('获取菜单失败');
        }
        
        const menus = await response.json();
        commit('SET_MENUS', menus);
        return menus;
      } catch (error) {
        console.error('获取菜单失败:', error);
        // 处理错误情况
        if (error.message && error.message.includes('401')) {
          dispatch('logout');
        }
        return [];
      }
    },
    
    logout({ commit }) {
      commit('CLEAR_AUTH');
    },
    
    async fetchLeads({ commit }, { page = 1, limit = 10 } = {}) {
      const response = await api.leads.getAll(page, limit);
      const data = await response.json();
      commit('SET_LEADS', data);
      return data;
    },
    
    async addLead({ commit }, leadData) {
      const response = await api.leads.create(leadData);
      const newLead = await response.json();
      commit('ADD_LEAD', newLead);
      return newLead;
    },
    
    async updateLead({ commit }, leadData) {
      const response = await api.leads.update(leadData.id, leadData);
      const updatedLead = await response.json();
      commit('UPDATE_LEAD', updatedLead);
      return updatedLead;
    },
    
    async deleteLead({ commit }, leadId) {
      await api.leads.delete(leadId);
      commit('DELETE_LEAD', leadId);
    },
    
    async fetchCustomers({ commit }, { page = 1, limit = 10 } = {}) {
      const response = await api.customers.getAll(page, limit);
      const data = await response.json();
      commit('SET_CUSTOMERS', data);
      return data;
    },
    
    async addCustomer({ commit }, customerData) {
      const response = await api.customers.create(customerData);
      const newCustomer = await response.json();
      commit('ADD_CUSTOMER', newCustomer);
      return newCustomer;
    },
    
    async updateCustomer({ commit }, customerData) {
      const response = await api.customers.update(customerData.id, customerData);
      const updatedCustomer = await response.json();
      commit('UPDATE_CUSTOMER', updatedCustomer);
      return updatedCustomer;
    },
    
    async deleteCustomer({ commit }, customerId) {
      await api.customers.delete(customerId);
      commit('DELETE_CUSTOMER', customerId);
    },
    
    async fetchQuotes({ commit }, { page = 1, limit = 10 } = {}) {
      const response = await api.quotes.getAll(page, limit);
      const data = await response.json();
      commit('SET_QUOTES', data);
      return data;
    },
    
    async addQuote({ commit }, quoteData) {
      const response = await api.quotes.create(quoteData);
      const newQuote = await response.json();
      commit('ADD_QUOTE', newQuote);
      return newQuote;
    },
    
    async updateQuote({ commit }, quoteData) {
      const response = await api.quotes.update(quoteData.id, quoteData);
      const updatedQuote = await response.json();
      commit('UPDATE_QUOTE', updatedQuote);
      return updatedQuote;
    },
    
    async deleteQuote({ commit }, quoteId) {
      await api.quotes.delete(quoteId);
      commit('DELETE_QUOTE', quoteId);
    },
    
    async fetchContracts({ commit }, { page = 1, limit = 10 } = {}) {
      const response = await api.contracts.getAll(page, limit);
      const data = await response.json();
      commit('SET_CONTRACTS', data);
      return data;
    },
    
    async addContract({ commit }, contractData) {
      const response = await api.contracts.create(contractData);
      const newContract = await response.json();
      commit('ADD_CONTRACT', newContract);
      return newContract;
    },
    
    async updateContract({ commit }, contractData) {
      const response = await api.contracts.update(contractData.id, contractData);
      const updatedContract = await response.json();
      commit('UPDATE_CONTRACT', updatedContract);
      return updatedContract;
    },
    
    async deleteContract({ commit }, contractId) {
      await api.contracts.delete(contractId);
      commit('DELETE_CONTRACT', contractId);
    },
    
    async fetchDashboardStats({ commit }) {
      const response = await api.stats.getDashboard();
      const stats = await response.json();
      commit('SET_DASHBOARD_STATS', stats);
      return stats;
    },
    
    async fetchFullDashboardData({ commit }) {
      const response = await api.dashboard.getFullData();
      const data = await response.json();
      commit('SET_FULL_DASHBOARD_DATA', data);
      return data;
    },
    
    async fetchDashboardAlerts({ commit }) {
      const response = await api.dashboard.getAlerts();
      const alerts = await response.json();
      commit('SET_DASHBOARD_ALERTS', alerts);
      return alerts;
    },
    
    async fetchDashboardTeamPerformance({ commit }) {
      const response = await api.dashboard.getTeamPerformance();
      const teamPerformance = await response.json();
      commit('SET_DASHBOARD_TEAM_PERFORMANCE', teamPerformance);
      return teamPerformance;
    },
    
    async fetchDashboardDealNews({ commit }) {
      const response = await api.dashboard.getDealNews();
      const dealNews = await response.json();
      commit('SET_DASHBOARD_DEAL_NEWS', dealNews);
      return dealNews;
    },
    
    async fetchDashboardHighPotentialCustomers({ commit }) {
      const response = await api.dashboard.getHighPotentialCustomers();
      const customers = await response.json();
      commit('SET_DASHBOARD_HIGH_POTENTIAL_CUSTOMERS', customers);
      return customers;
    },
    
    async fetchDashboardMarketingTips({ commit }) {
      const response = await api.dashboard.getMarketingTips();
      const tips = await response.json();
      commit('SET_DASHBOARD_MARKETING_TIPS', tips);
      return tips;
    },
    
    async fetchDashboardSalesForecast({ commit }) {
      const response = await api.dashboard.getSalesForecast();
      const forecast = await response.json();
      commit('SET_DASHBOARD_SALES_FORECAST', forecast);
      return forecast;
    }
  },
  
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    userRoles: state => state.roles,
    userPermissions: state => state.permissions,
    userMenus: state => state.menus,
    
    hasRole: (state) => (roleCode) => {
      return state.roles.some(role => role.code === roleCode);
    },
    
    hasPermission: (state) => (permissionCode) => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === permissionCode);
    },
    
    canCreateLeads: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'LEAD_CREATE');
    },
    
    canEditLeads: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'LEAD_EDIT');
    },
    
    canDeleteLeads: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'LEAD_DELETE');
    },
    
    canExportLeads: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'LEAD_EXPORT');
    },
    
    canCreateCustomers: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'CUSTOMER_CREATE');
    },
    
    canEditCustomers: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'CUSTOMER_EDIT');
    },
    
    canDeleteCustomers: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'CUSTOMER_DELETE');
    },
    
    canExportCustomers: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'CUSTOMER_EXPORT');
    },
    
    canCreateQuotes: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'QUOTE_CREATE');
    },
    
    canEditQuotes: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'QUOTE_EDIT');
    },
    
    canDeleteQuotes: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'QUOTE_DELETE');
    },
    
    canExportQuotes: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'QUOTE_EXPORT');
    },
    
    canCreateContracts: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'CONTRACT_CREATE');
    },
    
    canEditContracts: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'CONTRACT_EDIT');
    },
    
    canDeleteContracts: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'CONTRACT_DELETE');
    },
    
    canExportContracts: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'CONTRACT_EXPORT');
    },
    
    canAnalyze: state => {
      return state.roles.some(role => role.code === 'ADMIN') ||
             state.permissions.some(perm => perm.code === 'AI_ANALYZE');
    },
    
    allLeads: state => state.leads,
    allCustomers: state => state.customers,
    allQuotes: state => state.quotes,
    allContracts: state => state.contracts,
    dashboardStats: state => state.dashboardStats,
    dashboardAlerts: state => state.dashboardAlerts,
    dashboardTeamPerformance: state => state.dashboardTeamPerformance,
    dashboardDealNews: state => state.dashboardDealNews,
    dashboardHighPotentialCustomers: state => state.dashboardHighPotentialCustomers,
    dashboardMarketingTips: state => state.dashboardMarketingTips,
    dashboardSalesForecast: state => state.dashboardSalesForecast
  }
});

export default store;
