<template>
  <div class="leads-container">
    <div class="header-section">
      <h1>线索管理</h1>
      <div class="header-buttons">
        <button v-if="canExportLeads" @click="handleExport" class="btn btn-secondary">
          📊 导出
        </button>
        <button v-if="canCreateLeads" @click="showAddForm = !showAddForm" class="btn btn-primary">
          {{ showAddForm ? '取消' : '添加线索' }}
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
          <label>邮箱</label>
          <input v-model="formData.email" type="email" placeholder="输入邮箱" />
        </div>
        <div class="form-group">
          <label>电话</label>
          <input v-model="formData.phone" placeholder="输入电话" />
        </div>
        <div class="form-group">
          <label>状态</label>
          <select v-model="formData.status">
            <option value="新线索">新线索</option>
            <option value="跟进中">跟进中</option>
            <option value="已转化">已转化</option>
            <option value="已流失">已流失</option>
          </select>
        </div>
        <div class="form-group">
          <label>来源</label>
          <select v-model="formData.source">
            <option value="网站">网站</option>
            <option value="推荐">推荐</option>
            <option value="广告">广告</option>
            <option value="社交媒体">社交媒体</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-success">{{ editingLead ? '保存' : '添加' }}</button>
        <button type="button" @click="resetForm" class="btn btn-secondary">取消</button>
      </div>
    </form>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>邮箱</th>
            <th>电话</th>
            <th>状态</th>
            <th>来源</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lead in leads" :key="lead.id">
            <td>{{ lead.id }}</td>
            <td>{{ lead.name }}</td>
            <td>{{ lead.email }}</td>
            <td>{{ lead.phone }}</td>
            <td><span class="status-badge" :class="getStatusClass(lead.status)">{{ lead.status }}</span></td>
            <td>{{ lead.source }}</td>
            <td>{{ formatDate(lead.created_at) }}</td>
            <td>
              <div class="action-buttons">
                <button v-if="canAnalyze" @click="analyzeLead(lead)" class="btn btn-info">AI分析</button>
                <button v-if="canEditLeads" @click="editLead(lead)" class="btn btn-secondary">编辑</button>
                <button v-if="canDeleteLeads" @click="deleteLeadConfirmed(lead.id)" class="btn btn-danger">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- AI分析结果弹窗 -->
    <div v-if="showAiModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>AI分析结果</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div v-if="aiAnalysis.insights && aiAnalysis.insights.length > 0">
            <h4>洞察:</h4>
            <ul>
              <li v-for="(insight, index) in aiAnalysis.insights" :key="'insight-' + index">{{ insight }}</li>
            </ul>
          </div>
          <div v-if="aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0">
            <h4>建议:</h4>
            <ul>
              <li v-for="(suggestion, index) in aiAnalysis.suggestions" :key="'sug-' + index">{{ suggestion }}</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-primary">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { api } from '../utils/api';

export default {
  name: 'Leads',
  data() {
    return {
      showAddForm: false,
      editingLead: null,
      showAiModal: false,
      aiAnalysis: {},
      formData: {
        name: '',
        email: '',
        phone: '',
        status: '新线索',
        source: '网站'
      }
    };
  },
  computed: {
    ...mapGetters([
      'allLeads',
      'canCreateLeads',
      'canEditLeads',
      'canDeleteLeads',
      'canExportLeads',
      'canAnalyze'
    ]),
    leads() {
      return this.allLeads;
    }
  },
  async created() {
    try {
      await this.fetchLeads();
    } catch (error) {
      console.error('加载线索失败:', error);
      alert(error.message || '加载线索失败，请检查后端服务是否已启动');
    }
  },
  methods: {
    ...mapActions(['fetchLeads', 'addLead', 'updateLead', 'deleteLead']),
    resetForm() {
      this.editingLead = null;
      this.formData = {
        name: '',
        email: '',
        phone: '',
        status: '新线索',
        source: '网站'
      };
      this.showAddForm = false;
    },
    async handleSubmit() {
      if (this.editingLead) {
        await this.updateLead({ ...this.editingLead, ...this.formData });
      } else {
        await this.addLead(this.formData);
      }
      this.resetForm();
    },
    editLead(lead) {
      this.editingLead = { ...lead };
      this.formData = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        source: lead.source
      };
      this.showAddForm = true;
    },
    async deleteLeadConfirmed(id) {
      if (confirm('确定要删除这条线索吗？')) {
        await this.deleteLead(id);
      }
    },
    async analyzeLead(lead) {
      try {
        const response = await api.leads.analyze({ lead });
        this.aiAnalysis = await response.json();
        this.showAiModal = true;
      } catch (error) {
        console.error('AI分析失败:', error);
        alert('AI分析失败，请稍后再试');
      }
    },
    closeModal() {
      this.showAiModal = false;
      this.aiAnalysis = {};
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN');
    },
    getStatusClass(status) {
      const classMap = {
        '新线索': 'new',
        '跟进中': 'following',
        '已转化': 'converted',
        '已流失': 'lost'
      };
      return classMap[status] || '';
    },
    async handleExport() {
      try {
        const response = await api.export.exportData('leads');
        if (!response) return;
        
        const blob = await response.blob();
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
        
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
.leads-container {
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

.status-badge.new {
  background: #d4edda;
  color: #155724;
}

.status-badge.following {
  background: #cce5ff;
  color: #004085;
}

.status-badge.converted {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.lost {
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

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background-color: white;
  padding: 0;
  border-radius: 10px;
  max-width: 600px;
  max-height: 80vh;
  width: 90%;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 10px 10px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-body ul {
  list-style-type: disc;
  margin-left: 20px;
  padding-left: 10px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .leads-container {
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
  
  .modal-content {
    width: 95%;
    max-height: 90vh;
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
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 15px;
  }
}
</style>
