<template>
  <div class="add-quote-container">
    <div class="page-header">
      <h1>💰 创建报价单</h1>
      <button class="btn btn-secondary" @click="$router.push('/quotes')">返回列表</button>
    </div>

    <form class="quote-form card" @submit.prevent="submitQuote">
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
          <label for="validDate">有效期 *</label>
          <input type="date" id="validDate" v-model="formData.validDate" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="status">状态 *</label>
          <select id="status" v-model="formData.status" required>
            <option value="draft">草稿</option>
            <option value="sent">已发送</option>
            <option value="accepted">已接受</option>
            <option value="declined">已拒绝</option>
          </select>
        </div>
        <div class="form-group">
          <label for="currency">货币</label>
          <select id="currency" v-model="formData.currency">
            <option value="CNY">人民币 (CNY)</option>
            <option value="USD">美元 (USD)</option>
            <option value="EUR">欧元 (EUR)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="description">描述</label>
        <textarea id="description" v-model="formData.description" rows="3"></textarea>
      </div>

      <h3>报价项目</h3>
      <div class="items-table">
        <table class="data-table">
          <thead>
            <tr>
              <th>产品/服务</th>
              <th>描述</th>
              <th>数量</th>
              <th>单价</th>
              <th>小计</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in formData.items" :key="index">
              <td>
                <input type="text" v-model="item.product" placeholder="产品名称" required>
              </td>
              <td>
                <input type="text" v-model="item.description" placeholder="描述">
              </td>
              <td>
                <input type="number" v-model.number="item.quantity" min="1" required>
              </td>
              <td>
                <input type="number" v-model.number="item.unitPrice" step="0.01" min="0" required>
              </td>
              <td>{{ formatCurrency(item.quantity * item.unitPrice) }}</td>
              <td>
                <button type="button" class="btn btn-danger" @click="removeItem(index)">删除</button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="text-right"><strong>总计:</strong></td>
              <td><strong>{{ formatCurrency(totalAmount) }}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <button type="button" class="btn btn-primary add-item-btn" @click="addItem">
          + 添加项目
        </button>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-success">保存报价</button>
        <button type="button" class="btn btn-primary" @click="sendQuote" :disabled="!formData.id">
          发送报价
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'QuotesAdd',
  data() {
    return {
      formData: {
        customerId: '',
        validDate: '',
        status: 'draft',
        currency: 'CNY',
        description: '',
        items: [
          { product: '', description: '', quantity: 1, unitPrice: 0 }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['allCustomers']),
    customers() {
      return this.allCustomers;
    },
    totalAmount() {
      return this.formData.items.reduce((total, item) => {
        return total + (item.quantity * item.unitPrice);
      }, 0);
    }
  },
  async created() {
    await this.fetchCustomers();
  },
  methods: {
    ...mapActions(['fetchCustomers']),
    addItem() {
      this.formData.items.push({
        product: '',
        description: '',
        quantity: 1,
        unitPrice: 0
      });
    },
    removeItem(index) {
      if (this.formData.items.length > 1) {
        this.formData.items.splice(index, 1);
      }
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: this.formData.currency
      }).format(amount);
    },
    submitQuote() {
      // 这里应该调用API保存报价
      alert('报价已保存！');
      this.$router.push('/quotes');
    },
    sendQuote() {
      // 这里应该调用API发送报价
      alert('报价已发送！');
    }
  }
}
</script>

<style scoped>
.add-quote-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.quote-form {
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

.items-table {
  margin: 30px 0;
}

.add-item-btn {
  margin-top: 15px;
}

.text-right {
  text-align: right;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.data-table th,
.data-table td {
  padding: 12px;
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
