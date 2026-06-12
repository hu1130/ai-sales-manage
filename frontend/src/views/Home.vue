<template>
  <div class="home-container">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">欢迎来到AI销售管理系统</h1>
        <p class="hero-subtitle">智能驱动的销售管理平台，助力企业增长</p>
        <div class="hero-buttons">
          <button class="btn btn-primary" @click="goToDashboard">
            开始使用
          </button>
          <button class="btn btn-secondary" @click="showFeatures">
            了解更多
          </button>
        </div>
      </div>
      <div class="hero-image">
        <div class="dashboard-preview">
          <div class="preview-header">
            <div class="status-indicator online"></div>
            <span>AI销售仪表盘</span>
          </div>
          <div class="preview-content">
            <div class="metric-card">
              <div class="metric-value">¥1,250,000</div>
              <div class="metric-label">本月销售额</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">42</div>
              <div class="metric-label">活跃客户</div>
            </div>
            <div class="chart-placeholder">
              <div class="chart-bar" style="height: 80%"></div>
              <div class="chart-bar" style="height: 60%"></div>
              <div class="chart-bar" style="height: 90%"></div>
              <div class="chart-bar" style="height: 70%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title">核心功能</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>智能分析</h3>
          <p>AI驱动的数据分析，洞察销售趋势，预测业绩表现</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">👥</div>
          <h3>客户管理</h3>
          <p>全面的客户信息管理，跟踪客户互动历史</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💰</div>
          <h3>销售追踪</h3>
          <p>实时监控销售流程，提升成交转化率</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>移动办公</h3>
          <p>随时随地访问数据，移动设备友好</p>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">1,200+</div>
          <div class="stat-label">活跃客户</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">98%</div>
          <div class="stat-label">客户满意度</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">24/7</div>
          <div class="stat-label">技术支持</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">50+</div>
          <div class="stat-label">功能模块</div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <h2>准备提升您的销售业绩？</h2>
      <p>立即开始使用我们的AI销售管理系统，体验智能化销售管理的便利</p>
      <button class="btn btn-primary large" @click="goToSignup">
        免费试用
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    goToDashboard() {
      this.$router.push('/dashboard');
    },
    showFeatures() {
      alert('更多功能详情...');
    },
    goToSignup() {
      alert('跳转到注册页面');
    }
  }
}
</script>

<style scoped>
.home-container {
  padding: 0;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 80px 60px;
  color: white;
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: 3rem;
  margin: 0 0 20px 0;
  font-weight: 700;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin: 0 0 30px 0;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #4361ee;
  color: white;
}

.btn-primary:hover {
  background: #3a0ca3;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn.large {
  padding: 16px 32px;
  font-size: 18px;
}

.dashboard-preview {
  background: white;
  border-radius: 16px;
  padding: 20px;
  color: #212529;
  width: 350px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-weight: 600;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-indicator.online {
  background: #28a745;
}

.metric-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4361ee;
}

.metric-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.chart-placeholder {
  display: flex;
  gap: 5px;
  margin-top: 15px;
  align-items: flex-end;
  height: 80px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #4361ee, #3a0ca3);
  border-radius: 4px;
  min-height: 20px;
}

.features-section {
  padding: 80px 60px;
  background: white;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 50px;
  color: #212529;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
  border-radius: 16px;
  background: #f8f9fa;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.feature-card h3 {
  margin: 0 0 10px 0;
  color: #212529;
  font-size: 1.3rem;
}

.feature-card p {
  margin: 0;
  color: #6c757d;
  line-height: 1.6;
}

.stats-section {
  padding: 60px 60px;
  background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

.cta-section {
  padding: 80px 60px;
  text-align: center;
  background: #f8f9fa;
}

.cta-section h2 {
  font-size: 2rem;
  margin-bottom: 15px;
  color: #212529;
}

.cta-section p {
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 40px 20px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .features-section,
  .stats-section,
  .cta-section {
    padding: 40px 20px;
  }
  
  .section-title {
    font-size: 2rem;
  }
}
</style>