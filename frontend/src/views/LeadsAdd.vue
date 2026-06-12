<template>
  <div class="leads-add-container">
    <h1>添加线索</h1>
    <form @submit.prevent="submitLead" class="add-form">
      <div class="form-group">
        <label>姓名 *</label>
        <input v-model="newLead.name" required placeholder="请输入姓名" />
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <input v-model="newLead.email" type="email" placeholder="请输入邮箱" />
      </div>
      <div class="form-group">
        <label>电话</label>
        <input v-model="newLead.phone" placeholder="请输入电话" />
      </div>
      <div class="form-group">
        <label>状态</label>
        <select v-model="newLead.status">
          <option value="新线索">新线索</option>
          <option value="跟进中">跟进中</option>
          <option value="已转化">已转化</option>
          <option value="已放弃">已放弃</option>
        </select>
      </div>
      <div class="form-group">
        <label>来源</label>
        <select v-model="newLead.source">
          <option value="网站">网站</option>
          <option value="推荐">推荐</option>
          <option value="广告">广告</option>
          <option value="社交媒体">社交媒体</option>
          <option value="线下活动">线下活动</option>
        </select>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">保存线索</button>
        <button type="button" class="btn btn-secondary" @click="$router.go(-1)">取消</button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'LeadsAdd',
  data() {
    return {
      newLead: {
        name: '',
        email: '',
        phone: '',
        status: '新线索',
        source: '网站'
      }
    };
  },
  methods: {
    ...mapActions({
      createLead: 'addLead'
    }),
    async submitLead() {
      if (!this.newLead.name) {
        alert('请填写姓名');
        return;
      }
      
      await this.createLead(this.newLead);
      this.$router.push('/leads'); // 添加成功后跳转到线索列表
    }
  }
};
</script>

<style scoped>
.leads-add-container {
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
