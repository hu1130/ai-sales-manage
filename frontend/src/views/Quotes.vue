<template>
  <div class="quotes-container">
    <div class="header-section">
      <h1>报价管理</h1>
      <div class="header-buttons">
        <button v-if="canExportQuotes" @click="handleExport" class="btn btn-secondary">
          📊 导出
        </button>
        <button v-if="canCreateQuotes" @click="showAddForm = !showAddForm" class="btn btn-primary">
          {{ showAddForm ? '取消' : '创建报价' }}
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
          <label>金额</label>
          <input v-model.number="formData.amount" type="number" step="0.01" placeholder="输入金额" />
        </div>
        <div class="form-group">
          <label>状态</label>
          <select v-model="formData.status">
            <option value="草稿">草稿</option>
            <option value="待审批">待审批</option>
            <option value="已接受">已接受</option>
            <option value="已拒绝">已拒绝</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-success">{{ editingQuote ? '保存' : '创建' }}</button>
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
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="quote in quotes" :key="quote.id">
            <td>{{ quote.id }}</td>
            <td>{{ quote.customer_name || `客户 #${quote.customer_id}` }}</td>
            <td>¥{{ Number(quote.amount || 0).toLocaleString() }}</td>
            <td><span class="status-badge" :class="getStatusClass(quote.status)">{{ quote.status }}</span></td>
            <td>{{ formatDate(quote.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <button v-if="canEditQuotes" @click="editQuote(quote)" class="btn btn-secondary">编辑</button>
                <button v-if="canDeleteQuotes" @click="deleteQuoteConfirmed(quote.id)" class="btn btn-danger">删除</button>
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
  name: 'Quotes',
  data() {
    return {
      showAddForm: false,
      editingQuote: null,
      formData: {
        customer_id: null,
        amount: null,
        items: '',
        status: '草稿'
      }
    };
  },
  computed: {
    ...mapGetters([
      'allQuotes',
      'canCreateQuotes',
      'canEditQuotes',
      'canDeleteQuotes',
      'canExportQuotes'
    ]),
    quotes() {
      return this.allQuotes;
    }
  },
  async created() {
    try {
      await this.fetchQuotes();
    } catch (error) {
      console.error('加载报价失败:', error);
      alert(error.message || '加载报价失败，请检查后端服务是否已启动');
    }
  },
  methods: {
    ...mapActions(['fetchQuotes', 'addQuote', 'updateQuote', 'deleteQuote']),
    resetForm() {
      this.editingQuote = null;
      this.formData = {
        customer_id: null,
        amount: null,
        items: '',
        status: '草稿'
      };
      this.showAddForm = false;
    },
    async handleSubmit() {
      if (this.editingQuote) {
        await this.updateQuote({ ...this.editingQuote, ...this.formData });
      } else {
        await this.addQuote(this.formData);
      }
      this.resetForm();
    },
    editQuote(quote) {
      this.editingQuote = { ...quote };
      this.formData = {
        customer_id: quote.customer_id,
        amount: quote.amount,
        items: quote.items,
        status: quote.status
      };
      this.showAddForm = true;
    },
    async deleteQuoteConfirmed(id) {
      if (confirm('确定要删除这个报价吗？')) {
        await this.deleteQuote(id);
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
        '待审批': 'pending',
        '已接受': 'accepted',
        '已拒绝': 'rejected'
      };
      return classMap[status] || '';
    },
    async handleExport() {
      try {
        const response = await api.export.exportData('quotes');
        if (!response) return;
        
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `quotes_${new Date().toISOString().slice(0, 10)}.csv`;
        
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
.quotes-container {
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

.status-badge.accepted {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
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
  .quotes-container {
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
