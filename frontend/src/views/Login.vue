<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">🤖</div>
        <h1>AI Sales Pro</h1>
        <p>智能销售管理系统</p>
      </div>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            required
          />
        </div>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      errorMsg: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.errorMsg = ''
      this.loading = true

      try {
        await this.$store.dispatch('login', {
          username: this.username,
          password: this.password
        })
        this.$router.push('/dashboard')
      } catch (error) {
        this.errorMsg = error.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e2a4a 0%, #2c3e50 50%, #4361ee 100%);
  overflow: auto;
}

.login-card {
  width: 400px;
  max-width: 90vw;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 48px 40px 36px;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.login-logo {
  font-size: 3rem;
  margin-bottom: 12px;
}

.login-header h1 {
  margin: 0 0 6px;
  font-size: 1.6rem;
  color: #1e2a4a;
  font-weight: 700;
}

.login-header p {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #212529;
}

.form-group input {
  padding: 12px 16px;
  border: 1.5px solid #dee2e6;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #f8f9fa;
}

.form-group input:focus {
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  background: #fff;
}

.error-msg {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.08);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.login-btn {
  padding: 14px;
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  margin-top: 4px;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

</style>
