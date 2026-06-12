<template>
  <div class="customers-container">
    <div class="header-section">
      <h1>客户管理</h1>
      <div class="header-buttons">
        <button v-if="canExportCustomers" @click="handleExport" class="btn btn-secondary">
          📊 导出
        </button>
        <button v-if="canCreateCustomers" @click="showAddForm = !showAddForm" class="btn btn-primary">
          {{ showAddForm ? '取消' : '添加客户' }}
        </button>
      </div>
    </div>

    <form v-if="showAddForm" @submit.prevent="handleSubmit" class="add-form">
      <div class="form-grid">
        <div class="form-group">
          <label>姓名</label>
          <input v-model="formData.name" required placeholder="输入姓名" />
        </div>
        <div class="form-group">
          <label>公司</label>
          <input v-model="formData.company" placeholder="输入公司" />
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="formData.email" type="email" placeholder="输入邮箱" />
        </div>
        <div class="form-group">
          <label>电话</label>
          <input v-model="formData.phone" placeholder="输入电话" />
        </div>
        <div class="form-group">
          <label>关联线索</label>
          <input v-model.number="formData.lead_id" type="number" placeholder="输入线索ID（可选）" />
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-success">{{ editingCustomer ? '保存' : '添加' }}</button>
        <button type="button" @click="resetForm" class="btn btn-secondary">取消</button>
      </div>
    </form>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>公司</th>
            <th>邮箱</th>
            <th>电话</th>
            <th>关联线索</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.id">
            <td>{{ customer.id }}</td>
            <td>{{ customer.name }}</td>
            <td>{{ customer.company }}</td>
            <td>{{ customer.email }}</td>
            <td>{{ customer.phone }}</td>
            <td>{{ customer.lead_id ? `线索 #${customer.lead_id}` : '-' }}</td>
            <td>{{ formatDate(customer.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <button @click="viewDetail(customer.id)" class="btn btn-info">详情</button>
                <button v-if="canEditCustomers" @click="editCustomer(customer)" class="btn btn-secondary">编辑</button>
                <button v-if="canDeleteCustomers" @click="deleteCustomerConfirmed(customer.id)" class="btn btn-danger">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { api } from '../utils/api';

export default {
  name: 'Customers',
  data() {
    return {
      showAddForm: false,
      editingCustomer: null,
      formData: {
        name: '',
        company: '',
        email: '',
        phone: '',
        lead_id: null
      }
    };
  },
  computed: {
    ...mapGetters([
      'allCustomers',
      'canCreateCustomers',
      'canEditCustomers',
      'canDeleteCustomers',
      'canExportCustomers'
    ]),
    customers() {
      return this.allCustomers;
    }
  },
  async created() {
    try {
      await this.fetchCustomers();
    } catch (error) {
      console.error('加载客户失败:', error);
      alert(error.message || '加载客户失败，请检查后端服务是否已启动');
    }
  },
  methods: {
    ...mapActions(['fetchCustomers', 'addCustomer', 'updateCustomer', 'deleteCustomer']),
    resetForm() {
      this.editingCustomer = null;
      this.formData = {
        name: '',
        company: '',
        email: '',
        phone: '',
        lead_id: null
      };
      this.showAddForm = false;
    },
    async handleSubmit() {
      if (this.editingCustomer) {
        await this.updateCustomer({ ...this.editingCustomer, ...this.formData });
      } else {
        await this.addCustomer(this.formData);
      }
      this.resetForm();
    },
    editCustomer(customer) {
      this.editingCustomer = { ...customer };
      this.formData = {
        name: customer.name,
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
        lead_id: customer.lead_id
      };
      this.showAddForm = true;
    },
    async deleteCustomerConfirmed(id) {
      if (confirm('确定要删除这个客户吗？')) {
        await this.deleteCustomer(id);
      }
    },
    viewDetail(id) {
      this.$router.push(`/customers/detail/${id}`);
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    },
    async handleExport() {
      try {
        const response = await api.export.exportData('customers');
        if (!response) return;
        
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('导出成功！');
      } catch (error) {
        console.error('导出失败:', error);
        alert('导出失败，请稍后再试');
      }
    }
  }
};
</script>

<style scoped>
.customers-container {
  padding: 0;
  width: 100%;
  height: 100%;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.add-form {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.form-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.table-container {
  overflow-x: auto;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.data-table th,
.data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
}

.data-table tbody tr:hover {
  background-color: #f8f9fa;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-info {
  background-color: #4cc9f0;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .customers-container {
    padding: 15px;
  }
  
  .header-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .add-form {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .table-container {
    font-size: 0.9em;
  }
  
  .data-table th,
  .data-table td {
    padding: 8px 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 5px;
  }
}

@media (max-width: 480px) {
  .header-section h1 {
    font-size: 1.5rem;
  }
  
  .add-form {
    padding: 15px;
  }
  
  .form-group input {
    padding: 8px;
  }
  
  .data-table {
    font-size: 0.8em;
  }
  
  .data-table th,
  .data-table td {
    padding: 6px 8px;
  }
}
</style>
