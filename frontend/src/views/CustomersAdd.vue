<template>
  <div class="customers-add-container">
    <h1>添加客户</h1>
    <form @submit.prevent="submitCustomer" class="add-form">
      <div class="form-group">
        <label>客户姓名 *</label>
        <input v-model="newCustomer.name" required placeholder="请输入客户姓名" />
      </div>
      <div class="form-group">
        <label>公司名称</label>
        <input v-model="newCustomer.company" placeholder="请输入公司名称" />
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <input v-model="newCustomer.email" type="email" placeholder="请输入邮箱" />
      </div>
      <div class="form-group">
        <label>电话</label>
        <input v-model="newCustomer.phone" placeholder="请输入电话" />
      </div>
      <div class="form-group">
        <label>关联线索</label>
        <select v-model="newCustomer.lead_id">
          <option value="">无关联</option>
          <option v-for="lead in leads" :key="lead.id" :value="lead.id">
            {{ lead.name }} ({{ lead.email || '无邮箱' }})
          </option>
        </select>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">保存客户</button>
        <button type="button" class="btn btn-secondary" @click="$router.go(-1)">取消</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'CustomersAdd',
  data() {
    return {
      newCustomer: {
        name: '',
        company: '',
        email: '',
        phone: '',
        lead_id: ''
      }
    };
  },
  computed: {
    ...mapGetters(['allLeads']),
    leads() {
      return this.allLeads;
    }
  },
  methods: {
    ...mapActions({
      createCustomer: 'addCustomer',
      fetchLeads: 'fetchLeads'
    }),
    async submitCustomer() {
      if (!this.newCustomer.name) {
        alert('请填写客户姓名');
        return;
      }
      
      // 如果没有选择关联线索，则设为null
      if (!this.newCustomer.lead_id) {
        this.newCustomer.lead_id = null;
      }
      
      try {
        await this.createCustomer(this.newCustomer);
        this.$router.push('/customers'); // 添加成功后跳转到客户列表
      } catch (error) {
        console.error('添加客户失败:', error);
        alert('添加客户失败，请重试');
      }
    }
  },
  async created() {
    await this.fetchLeads(); // 获取线索列表用于关联
  }
};
</script>

<style scoped>
.customers-add-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.add-form {
  max-width: 600px;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
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
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}
</style>
