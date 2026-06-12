<template>
  <div class="customers-list-container">
    <div class="list-header">
      <h1>客户管理</h1>
      <div class="header-actions">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="搜索客户..." 
            v-model="searchQuery"
            @input="filterCustomers"
          />
          <span class="search-icon">🔍</span>
        </div>
        <select v-model="filterType" @change="filterCustomers">
          <option value="">所有类型</option>
          <option value="enterprise">企业客户</option>
          <option value="government">政府机构</option>
          <option value="education">教育机构</option>
          <option value="individual">个人客户</option>
        </select>
        <select v-model="filterIndustry" @change="filterCustomers">
          <option value="">所有行业</option>
          <option value="tech">科技</option>
          <option value="finance">金融</option>
          <option value="healthcare">医疗</option>
          <option value="education">教育</option>
          <option value="retail">零售</option>
          <option value="energy">能源</option>
          <option value="other">其他</option>
        </select>
        <button class="btn btn-primary" @click="addCustomer">
          <span class="btn-icon">+</span>
          添加客户
        </button>
      </div>
    </div>

    <div class="stats-summary">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-number">{{ filteredCustomers.length }}</div>
          <div class="stat-label">客户总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💼</div>
        <div class="stat-info">
          <div class="stat-number">{{ enterpriseCount }}</div>
          <div class="stat-label">企业客户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-number">¥{{ formatCurrency(totalDealValue) }}</div>
          <div class="stat-label">总交易额</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <div class="stat-number">{{ activeCustomers }}</div>
          <div class="stat-label">活跃客户</div>
        </div>
      </div>
    </div>

    <div class="loading" v-if="loading">加载中...</div>
    <div class="error" v-else-if="error">{{ error }}</div>
    <div class="customers-table" v-else>
      <div class="table-header">
        <div class="col-checkbox">
          <input 
            type="checkbox" 
            @change="toggleSelectAll"
            :checked="allSelected"
          />
        </div>
        <div class="col-name">客户名称</div>
        <div class="col-contact">联系人</div>
        <div class="col-type">类型</div>
        <div class="col-industry">行业</div>
        <div class="col-status">状态</div>
        <div class="col-deal">交易额</div>
        <div class="col-actions">操作</div>
      </div>

      <div 
        class="table-row" 
        v-for="customer in paginatedCustomers" 
        :key="customer.id"
        :class="{ selected: selectedCustomers.includes(customer.id) }"
      >
        <div class="col-checkbox">
          <input 
            type="checkbox" 
            :checked="selectedCustomers.includes(customer.id)"
            @change="toggleCustomerSelection(customer.id)"
          />
        </div>
        <div class="col-name" @click="viewCustomer(customer.id)">
          <div class="customer-avatar">{{ getInitials(customer.name) }}</div>
          <div class="customer-info">
            <div class="customer-name">{{ customer.name }}</div>
            <div class="customer-email">{{ customer.email }}</div>
          </div>
        </div>
        <div class="col-contact">{{ customer.contactPerson }}</div>
        <div class="col-type">
          <span class="type-badge" :class="customer.type">{{ getCustomerTypeLabel(customer.type) }}</span>
        </div>
        <div class="col-industry">{{ getIndustryLabel(customer.industry) }}</div>
        <div class="col-status">
          <span class="status-badge" :class="customer.status">{{ customer.status }}</span>
        </div>
        <div class="col-deal">¥{{ formatCurrency(customer.dealValue) }}</div>
        <div class="col-actions">
          <button class="btn btn-sm btn-outline" @click="viewCustomer(customer.id)">查看</button>
          <button class="btn btn-sm btn-outline" @click="editCustomer(customer.id)">编辑</button>
          <button class="btn btn-sm btn-danger" @click="deleteCustomer(customer.id)">删除</button>
        </div>
      </div>

      <div class="empty-state" v-if="filteredCustomers.length === 0">
        <div class="empty-icon">📋</div>
        <h3>暂无客户数据</h3>
        <p>您可以添加新客户或调整筛选条件</p>
        <button class="btn btn-primary" @click="addCustomer">添加客户</button>
      </div>
    </div>

    <div class="pagination-controls" v-if="!loading && !error && filteredCustomers.length > 0">
      <div class="pagination-info">
        显示第 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredCustomers.length) }} 条，
        共 {{ filteredCustomers.length }} 条
      </div>
      <div class="pagination-buttons">
        <button 
          class="btn btn-outline" 
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button 
          class="btn btn-outline" 
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'CustomersList',
  data() {
    return {
      searchQuery: '',
      filterType: '',
      filterIndustry: '',
      currentPage: 1,
      pageSize: 10,
      selectedCustomers: [],
      loading: true,
      error: '',
      filteredCustomers: []
    };
  },
  computed: {
    ...mapGetters(['allCustomers']),
    customers() {
      return this.allCustomers;
    },
    allSelected() {
      return this.filteredCustomers.length > 0 && 
             this.selectedCustomers.length === this.filteredCustomers.length;
    },
    paginatedCustomers() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredCustomers.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredCustomers.length / this.pageSize);
    },
    enterpriseCount() {
      return this.customers.filter(c => c.type === 'enterprise').length;
    },
    totalDealValue() {
      return this.customers.reduce((sum, customer) => sum + (customer.dealValue || 0), 0);
    },
    activeCustomers() {
      return this.customers.filter(c => c.status === 'active').length;
    }
  },
  async mounted() {
    await this.loadData();
  },
  watch: {
    allCustomers(newCustomers) {
      this.filteredCustomers = [...newCustomers];
    }
  },
  methods: {
    ...mapActions(['fetchCustomers', 'deleteCustomer']),
    async loadData() {
      this.loading = true;
      this.error = '';
      try {
        await this.fetchCustomers();
        this.filteredCustomers = [...this.allCustomers];
      } catch (err) {
        this.error = '加载数据失败';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    filterCustomers() {
      let result = [...this.customers];
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(customer => 
          customer.name?.toLowerCase().includes(query) ||
          customer.contactPerson?.toLowerCase().includes(query) ||
          customer.email?.toLowerCase().includes(query)
        );
      }
      
      if (this.filterType) {
        result = result.filter(customer => customer.type === this.filterType);
      }
      
      if (this.filterIndustry) {
        result = result.filter(customer => customer.industry === this.filterIndustry);
      }
      
      this.filteredCustomers = result;
      this.currentPage = 1; // 重置到第一页
    },
    toggleSelectAll() {
      if (this.allSelected) {
        this.selectedCustomers = [];
      } else {
        this.selectedCustomers = this.paginatedCustomers.map(c => c.id);
      }
    },
    toggleCustomerSelection(customerId) {
      if (this.selectedCustomers.includes(customerId)) {
        this.selectedCustomers = this.selectedCustomers.filter(id => id !== customerId);
      } else {
        this.selectedCustomers.push(customerId);
      }
    },
    getInitials(name) {
      if (!name) return '';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },
    getCustomerTypeLabel(type) {
      const types = {
        enterprise: '企业',
        government: '政府',
        education: '教育',
        individual: '个人'
      };
      return types[type] || type;
    },
    getIndustryLabel(industry) {
      const industries = {
        tech: '科技',
        finance: '金融',
        healthcare: '医疗',
        education: '教育',
        retail: '零售',
        energy: '能源',
        other: '其他'
      };
      return industries[industry] || industry;
    },
    formatCurrency(amount) {
      return Number(amount || 0).toLocaleString('zh-CN');
    },
    viewCustomer(id) {
      this.$router.push(`/customers/${id}`);
    },
    editCustomer(id) {
      this.$router.push(`/customers/edit/${id}`);
    },
    async deleteCustomer(id) {
      if (confirm('确定要删除这个客户吗？')) {
        try {
          await this.deleteCustomer(id);
        } catch (err) {
          alert('删除失败');
          console.error(err);
        }
      }
    },
    addCustomer() {
      this.$router.push('/customers/add');
    }
  }
}
</script>

<style scoped>
.customers-list-container {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.list-header h1 {
  margin: 0;
  color: #212529;
  font-size: 1.8rem;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-box input {
  padding: 10px 40px 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  min-width: 200px;
  box-sizing: border-box;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

select {
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  min-width: 120px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.btn-primary {
  background: #4361ee;
  color: white;
}

.btn-primary:hover {
  background: #3a0ca3;
}

.btn-outline {
  background: transparent;
  border: 1px solid #ced4da;
  color: #495057;
}

.btn-outline:hover {
  background: #f8f9fa;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.error {
  color: #dc3545;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 2rem;
}

.stat-info .stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4361ee;
  margin-bottom: 5px;
}

.stat-info .stat-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.customers-table {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.table-header {
  display: grid;
  grid-template-columns: 50px 2fr 1fr 1fr 1fr 1fr 1fr 1.5fr;
  background: #f8f9fa;
  padding: 15px 20px;
  font-weight: 600;
  color: #495057;
  border-bottom: 1px solid #e9ecef;
}

.table-row {
  display: grid;
  grid-template-columns: 50px 2fr 1fr 1fr 1fr 1fr 1fr 1.5fr;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  transition: background 0.3s ease;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: #f8f9fa;
}

.table-row.selected {
  background: #e7f5ff;
}

.col-checkbox {
  display: flex;
  align-items: center;
}

.col-name {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.customer-info .customer-name {
  font-weight: 600;
  color: #212529;
  margin-bottom: 2px;
}

.customer-info .customer-email {
  font-size: 0.85rem;
  color: #6c757d;
}

.type-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-badge.enterprise {
  background: #d4edda;
  color: #155724;
}

.type-badge.government {
  background: #cce5ff;
  color: #004085;
}

.type-badge.education {
  background: #d1ecf1;
  color: #0c5460;
}

.type-badge.individual {
  background: #f8d7da;
  color: #721c24;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.prospect {
  background: #fff3cd;
  color: #856404;
}

.col-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #212529;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 20px 0;
  font-size: 1rem;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-info {
  padding: 0 15px;
  color: #6c757d;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 50px 2fr 1fr 1fr 1fr 1fr;
    grid-template-areas:
      "check name contact actions"
      "check type industry actions"
      "check status deal actions";
  }
  
  .col-type, .col-industry, .col-status, .col-deal {
    display: flex;
    align-items: center;
  }
  
  .col-type { grid-area: type; }
  .col-industry { grid-area: industry; }
  .col-status { grid-area: status; }
  .col-deal { grid-area: deal; }
  
  .col-actions {
    grid-area: actions;
    justify-content: flex-start;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .customers-list-container {
    padding: 10px;
  }
  
  .list-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .search-box input {
    min-width: 100%;
  }
  
  select {
    min-width: 100%;
  }
  
  .stats-summary {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 40px 1fr;
    grid-template-areas:
      "check name"
      "contact contact"
      "type industry"
      "status deal"
      "actions actions";
    gap: 8px;
    padding: 12px 15px;
  }
  
  .col-name {
    grid-area: name;
  }
  
  .col-contact {
    grid-area: contact;
    display: flex;
    align-items: center;
  }
  
  .col-actions {
    grid-area: actions;
    justify-content: flex-start;
    margin-top: 5px;
  }
  
  .pagination-controls {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .customer-info .customer-name {
    font-size: 0.95rem;
  }
  
  .customer-info .customer-email {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .list-header h1 {
    font-size: 1.5rem;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-summary {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-info .stat-number {
    font-size: 1.2rem;
  }
  
  .stat-info .stat-label {
    font-size: 0.8rem;
  }
  
  .table-header,
  .table-row {
    padding: 10px;
    font-size: 0.9em;
  }
  
  .customer-avatar {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
  
  .pagination-info {
    font-size: 0.8rem;
  }
  
  .page-info {
    font-size: 0.8rem;
  }
  
  .btn {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .btn-sm {
    padding: 4px 8px;
    font-size: 0.8rem;
  }
}
</style>
