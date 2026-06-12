<template>
  <div class="add-contract-container">
    <div class="page-header">
      <h1>📋 创建合同</h1>
      <button class="btn btn-secondary" @click="$router.push('/contracts')">返回列表</button>
    </div>

    <form class="contract-form card" @submit.prevent="submitContract">
      <div class="form-row">
        <div class="form-group">
          <label for="customer">客户 *</label>
          <select id="customer" v-model="formData.customerId" required>
            <option value="">请选择客户</option>
            <option v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="contractNo">合同编号 *</label>
          <input type="text" id="contractNo" v-model="formData.contractNo" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="startDate">开始日期 *</label>
          <input type="date" id="startDate" v-model="formData.startDate" required>
        </div>
        <div class="form-group">
          <label for="endDate">结束日期 *</label>
          <input type="date" id="endDate" v-model="formData.endDate" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="amount">合同金额 *</label>
          <input type="number" id="amount" v-model.number="formData.amount" step="0.01" min="0" required>
        </div>
        <div class="form-group">
          <label for="status">状态 *</label>
          <select id="status" v-model="formData.status" required>
            <option value="draft">草稿</option>
            <option value="pending">待审核</option>
            <option value="active">生效中</option>
            <option value="completed">已完成</option>
            <option value="terminated">已终止</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="currency">货币</label>
          <select id="currency" v-model="formData.currency">
            <option value="CNY">人民币 (CNY)</option>
            <option value="USD">美元 (USD)</option>
            <option value="EUR">欧元 (EUR)</option>
          </select>
        </div>
        <div class="form-group">
          <label for="paymentTerms">付款条款</label>
          <input type="text" id="paymentTerms" v-model="formData.paymentTerms">
        </div>
      </div>

      <div class="form-group">
        <label for="description">合同描述</label>
        <textarea id="description" v-model="formData.description" rows="4"></textarea>
      </div>

      <div class="form-group">
        <label for="terms">合同条款</label>
        <textarea id="terms" v-model="formData.terms" rows="6"></textarea>
      </div>

      <div class="form-group">
        <label for="attachments">附件</label>
        <div class="file-upload-area" @dragover.prevent @drop="handleDrop" @click="triggerFileInput">
          <input type="file" ref="fileInput" @change="handleFileSelect" multiple style="display: none;">
          <div class="upload-content">
            <div class="upload-icon">📁</div>
            <p>拖拽文件到这里或点击上传</p>
            <small>支持 PDF, DOC, XLS, JPG, PNG 格式</small>
          </div>
        </div>
        <div v-if="uploadedFiles.length" class="files-list">
          <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
            <span>{{ file.name }}</span>
            <button type="button" @click="removeFile(index)" class="btn btn-sm btn-danger">×</button>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-success">保存合同</button>
        <button type="button" class="btn btn-primary" @click="signContract" :disabled="!formData.id">
          立即签署
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'ContractsAdd',
  data() {
    return {
      formData: {
        customerId: '',
        contractNo: '',
        startDate: '',
        endDate: '',
        amount: 0,
        status: 'draft',
        currency: 'CNY',
        paymentTerms: '',
        description: '',
        terms: ''
      },
      uploadedFiles: []
    }
  },
  computed: {
    ...mapGetters(['allCustomers']),
    customers() {
      return this.allCustomers;
    }
  },
  async created() {
    await this.fetchCustomers();
  },
  methods: {
    ...mapActions(['fetchCustomers', 'addContract']),
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.uploadedFiles.push(...files);
    },
    handleDrop(event) {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
      this.uploadedFiles.push(...files);
    },
    removeFile(index) {
      this.uploadedFiles.splice(index, 1);
    },
    async submitContract() {
      try {
        await this.addContract(this.formData);
        this.$router.push('/contracts');
      } catch (err) {
        alert('保存合同失败');
        console.error(err);
      }
    },
    signContract() {
      // 这里应该调用API启动签署流程
      alert('签署流程已启动！');
    }
  }
}
</script>

<style scoped>
.add-contract-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.contract-form {
  padding: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #212529;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.file-upload-area {
  border: 2px dashed #ced4da;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}

.file-upload-area:hover {
  border-color: #4361ee;
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.upload-content p {
  margin: 10px 0;
  color: #6c757d;
}

.upload-content small {
  color: #adb5bd;
}

.files-list {
  margin-top: 15px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 5px;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.875rem;
}

.btn-danger {
  background: #dc3545;
  color: white;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-danger:hover {
  background: #c82333;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
