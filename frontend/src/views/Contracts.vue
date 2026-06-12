<template>
  <div class="contracts-container">
    <div class="header-section">
      <h1>合同管理</h1>
      <div class="header-buttons">
        <button v-if="canExportContracts" @click="handleExport" class="btn btn-secondary">
          📊 导出
        </button>
        <button v-if="canCreateContracts" @click="showAddForm = !showAddForm" class="btn btn-primary">
          {{ showAddForm ? '取消' : '创建合同' }}
        </button>
      </div>
    </div>

    <form v-if="showAddForm" @submit.prevent="handleSubmit" class="add-form">
      <div class="form-grid">
        <div class="form-group">
          <label>客户ID</label>
          <input v-model.number="formData.customer_id" type="number" required placeholder="输入客户ID" />
        </div>
        <div class="form-group">
          <label>报价ID</label>
          <input v-model.number="formData.quote_id" type="number" placeholder="输入报价ID（可选）" />
        </div>
        <div class="form-group">
          <label>金额</label>
          <input v-model.number="formData.amount" type="number" step="0.01" placeholder="输入金额" />
        </div>
        <div class="form-group">
          <label>状态</label>
          <select v-model="formData.status">
            <option value="草稿">草稿</option>
            <option value="待签署">待签署</option>
            <option value="已签署">已签署</option>
            <option value="已完成">已完成</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-success">{{ editingContract ? '保存' : '创建' }}</button>
        <button type="button" @click="resetForm" class="btn btn-secondary">取消</button>
      </div>
    </form>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>客户</th>
            <th>金额</th>
            <th>状态</th>
            <th>签署日期</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contract in contracts" :key="contract.id">
            <td>{{ contract.id }}</td>
            <td>{{ contract.customer_name || `客户 #${contract.customer_id}` }}</td>
            <td>¥{{ Number(contract.amount || 0).toLocaleString() }}</td>
            <td><span class="status-badge" :class="getStatusClass(contract.status)">{{ contract.status }}</span></td>
            <td>{{ contract.signed_date ? formatDate(contract.signed_date) : '-' }}</td>
            <td>{{ formatDate(contract.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <button v-if="canEditContracts" @click="editContract(contract)" class="btn btn-secondary">编辑</button>
                <button v-if="canDeleteContracts" @click="deleteContractConfirmed(contract.id)" class="btn btn-danger">删除</button>
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
  name: 'Contracts',
  data() {
    return {
      showAddForm: false,
      editingContract: null,
      formData: {
        customer_id: null,
        quote_id: null,
        amount: null,
        status: '草稿',
        signed_date: null
      }
    };
  },
  computed: {
    ...mapGetters([
      'allContracts',
      'canCreateContracts',
      'canEditContracts',
      'canDeleteContracts',
      'canExportContracts'
    ]),
    contracts() {
      return this.allContracts;
    }
  },
  async created() {
    try {
      await this.fetchContracts();
    } catch (error) {
      console.error('加载合同失败:', error);
      alert(error.message || '加载合同失败，请检查后端服务是否已启动');
    }
  },
  methods: {
    ...mapActions(['fetchContracts', 'addContract', 'updateContract', 'deleteContract']),
    resetForm() {
      this.editingContract = null;
      this.formData = {
        customer_id: null,
        quote_id: null,
        amount: null,
        status: '草稿',
        signed_date: null
      };
      this.showAddForm = false;
    },
    async handleSubmit() {
      if (this.editingContract) {
        await this.updateContract({ ...this.editingContract, ...this.formData });
      } else {
        await this.addContract(this.formData);
      }
      this.resetForm();
    },
    editContract(contract) {
      this.editingContract = { ...contract };
      this.formData = {
        customer_id: contract.customer_id,
        quote_id: contract.quote_id,
        amount: contract.amount,
        status: contract.status,
        signed_date: contract.signed_date
      };
      this.showAddForm = true;
    },
    async deleteContractConfirmed(id) {
      if (confirm('确定要删除这个合同吗？')) {
        await this.deleteContract(id);
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    },
    getStatusClass(status) {
      const classMap = {
        '草稿': 'draft',
        '待签署': 'pending',
        '已签署': 'signed',
        '已完成': 'completed'
      };
      return classMap[status] || '';
    },
    async handleExport() {
      try {
        const response = await api.export.exportData('contracts');
        if (!response) return;
        
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `contracts_${new Date().toISOString().slice(0, 10)}.csv`;
        
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
.contracts-container {
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
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

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.draft {
  background: #e2e3e5;
  color: #383d41;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.signed {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
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
  .contracts-container {
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
  
  .form-group input,
  .form-group select {
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
