<template>
  <div class="dashboard-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">加载中...</div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-banner">
      <span>⚠️ {{ error }}</span>
      <button @click="loadData" class="btn-retry">重试</button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon">💰</div>
        <div class="stat-info">
          <h3>今日销售额</h3>
          <p class="stat-value">{{ formatCurrency(dashboardStats?.total_sales || 0) }}</p>
          <p class="stat-trend positive">+12% <span>vs 昨日</span></p>
        </div>
      </div>
      <div class="stat-card secondary">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <h3>活跃客户</h3>
          <p class="stat-value">{{ dashboardStats?.total_customers || 0 }}</p>
          <p class="stat-trend positive">+5% <span>vs 上周</span></p>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <h3>待处理合同</h3>
          <p class="stat-value">{{ dashboardStats?.pending_contracts || 0 }}</p>
          <p class="stat-trend">-3 <span>较昨日</span></p>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">🔔</div>
        <div class="stat-info">
          <h3>待跟进线索</h3>
          <p class="stat-value">{{ dashboardStats?.pending_leads || 0 }}</p>
          <p class="stat-trend positive">+8 <span>较昨日</span></p>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="left-panel">
        <!-- 销售趋势 -->
        <div class="card">
          <h2>📈 销售趋势</h2>
          <div v-if="salesForecast.length > 0" class="forecast-list">
            <div v-for="item in salesForecast" :key="item.id" class="forecast-item">
              <span class="forecast-name">{{ item.metric_name }}</span>
              <div class="forecast-bar">
                <div class="forecast-progress" :style="{ width: (item.predicted_value / item.current_value * 100) + '%' }"></div>
              </div>
              <span class="forecast-rate" :class="{ positive: item.change_rate > 0 }">
                {{ item.change_rate > 0 ? '+' : '' }}{{ item.change_rate }}%
              </span>
            </div>
          </div>
          <div v-else class="empty-state">暂无预测数据</div>
        </div>
        
        <!-- 最新提醒 -->
        <div class="card">
          <h2>🔔 最新提醒</h2>
          <div v-if="alerts.length > 0" class="alerts-list">
            <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="alert.priority">
              <div class="alert-icon">{{ getAlertIcon(alert.type) }}</div>
              <div class="alert-content">
                <h4>{{ alert.title }}</h4>
                <p>{{ alert.content }}</p>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无提醒</div>
        </div>
      </div>

      <div class="right-panel">
        <!-- AI 洞察 -->
        <div class="card">
          <h2>🤖 AI 洞察</h2>
          <div v-if="highPotentialCustomers.length > 0 || marketingTips.length > 0" class="ai-insights">
            <div v-if="highPotentialCustomers.length > 0" class="insight-section">
              <h4>🔥 高潜力客户</h4>
              <div v-for="customer in highPotentialCustomers" :key="customer.id" class="insight-item">
                <div class="insight-header">
                  <span class="insight-title">{{ customer.customer_name }}</span>
                  <span class="potential-badge">{{ customer.potential_score }}分</span>
                </div>
                <p>{{ customer.reason }}</p>
              </div>
            </div>
            <div v-if="marketingTips.length > 0" class="insight-section">
              <h4>💡 营销建议</h4>
              <div v-for="tip in marketingTips" :key="tip.id" class="insight-item">
                <p>{{ tip.content }}</p>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无洞察数据</div>
          <button @click="refreshInsights" class="btn btn-primary btn-sm">获取更多洞察</button>
        </div>

        <!-- 团队表现 -->
        <div class="card">
          <h2>👥 团队表现</h2>
          <div v-if="teamPerformance.length > 0" class="team-stats">
            <div v-for="member in teamPerformance" :key="member.id" class="team-member">
              <div class="member-avatar">{{ member.avatar }}</div>
              <div class="member-info">
                <h4>{{ member.member_name }}</h4>
                <p>本周业绩: {{ formatCurrency(member.weekly_sales) }}</p>
              </div>
              <div class="performance-bar">
                <div class="progress" :style="{ width: member.performance_rate + '%' }"></div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无团队数据</div>
        </div>

        <!-- 成交喜报 -->
        <div class="card">
          <h2>🎉 成交喜报</h2>
          <div v-if="dealNews.length > 0" class="deal-news-list">
            <div v-for="news in dealNews" :key="news.id" class="deal-news-item">
              <div class="deal-icon">🎊</div>
              <div class="deal-content">
                <h4>{{ news.customer_name }}</h4>
                <p class="deal-amount">{{ formatCurrency(news.amount) }}</p>
                <p class="deal-desc">{{ news.content }}</p>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无成交喜报</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: true,
      error: null
    };
  },
  computed: {
    ...mapGetters([
      'dashboardStats',
      'dashboardAlerts',
      'dashboardTeamPerformance',
      'dashboardDealNews',
      'dashboardHighPotentialCustomers',
      'dashboardMarketingTips',
      'dashboardSalesForecast'
    ]),
    alerts() {
      return this.$store.state.dashboardAlerts;
    },
    teamPerformance() {
      return this.$store.state.dashboardTeamPerformance;
    },
    dealNews() {
      return this.$store.state.dashboardDealNews;
    },
    highPotentialCustomers() {
      return this.$store.state.dashboardHighPotentialCustomers;
    },
    marketingTips() {
      return this.$store.state.dashboardMarketingTips;
    },
    salesForecast() {
      return this.$store.state.dashboardSalesForecast;
    }
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    ...mapActions(['fetchFullDashboardData', 'fetchDashboardStats']),
    
    async loadData() {
      this.loading = true;
      this.error = null;
      try {
        await this.fetchFullDashboardData();
      } catch (error) {
        console.error('加载仪表盘数据失败:', error);
        this.error = '加载数据失败，请检查网络连接';
      } finally {
        this.loading = false;
      }
    },
    
    async refreshInsights() {
      try {
        await this.loadData();
        alert('洞察已更新！');
      } catch (error) {
        console.error('刷新洞察失败:', error);
      }
    },
    
    formatCurrency(amount) {
      return '¥' + Number(amount || 0).toLocaleString();
    },
    
    getAlertIcon(type) {
      const iconMap = {
        '合同到期': '📅',
        '风险预警': '⚠️',
        '新线索': '🌟',
        '报价审批': '📄',
        '会议提醒': '🗓️',
        '合同签署': '✍️'
      };
      return iconMap[type] || '📌';
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 0;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 16px;
}

.loading-spinner {
  font-size: 1.2rem;
  color: #4361ee;
}

.error-banner {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-retry {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.stat-card.primary { border-top: 4px solid #4361ee; }
.stat-card.secondary { border-top: 4px solid #3f37c9; }
.stat-card.success { border-top: 4px solid #4cc9f0; }
.stat-card.warning { border-top: 4px solid #f72585; }

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.stat-info h3 {
  margin: 0 0 8px 0;
  color: #6c757d;
  font-size: 1rem;
  font-weight: 500;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #212529;
  margin: 0 0 5px 0;
}

.stat-trend {
  margin: 0;
  color: #dc3545;
  font-weight: 500;
  font-size: 0.9rem;
}

.stat-trend.positive {
  color: #28a745;
}

.stat-trend span {
  color: #6c757d;
  font-weight: normal;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.left-panel .card,
.right-panel .card {
  margin-bottom: 20px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.card h2 {
  margin: 0 0 20px 0;
  color: #212529;
  font-size: 1.3rem;
}

.forecast-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.forecast-item {
  display: grid;
  grid-template-columns: 100px 1fr 60px;
  gap: 10px;
  align-items: center;
}

.forecast-name {
  font-size: 0.9rem;
  color: #333;
}

.forecast-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.forecast-progress {
  height: 100%;
  background: linear-gradient(to right, #4361ee, #4cc9f0);
  border-radius: 4px;
  transition: width 1s ease;
}

.forecast-rate {
  font-size: 0.9rem;
  color: #dc3545;
  font-weight: 600;
}

.forecast-rate.positive {
  color: #28a745;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid;
  transition: transform 0.2s ease;
}

.alert-item:hover {
  transform: translateX(5px);
}

.alert-item.high {
  background: rgba(247, 37, 133, 0.05);
  border-left-color: #f72585;
}

.alert-item.normal {
  background: rgba(67, 97, 238, 0.05);
  border-left-color: #4361ee;
}

.alert-item.warning {
  background: rgba(255, 193, 7, 0.1);
  border-left-color: #ffc107;
}

.alert-item.success {
  background: rgba(76, 201, 240, 0.1);
  border-left-color: #4cc9f0;
}

.alert-icon {
  font-size: 1.2rem;
  margin-top: 2px;
}

.alert-content h4 {
  margin: 0 0 4px 0;
  color: #212529;
  font-size: 1rem;
}

.alert-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.ai-insights {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 15px;
}

.insight-section h4 {
  margin: 0 0 10px 0;
  color: #212529;
  font-size: 1rem;
}

.insight-item {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.insight-title {
  font-weight: 600;
  color: #212529;
}

.potential-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.insight-item p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.team-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4361ee;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.member-info {
  min-width: 120px;
}

.member-info h4 {
  margin: 0 0 2px 0;
  font-size: 1rem;
  color: #212529;
}

.member-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.85rem;
}

.performance-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(to right, #4361ee, #4cc9f0);
  border-radius: 3px;
  transition: width 1s ease;
}

.deal-news-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.deal-news-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.deal-icon {
  font-size: 1.5rem;
}

.deal-content h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
}

.deal-amount {
  margin: 0 0 4px 0;
  font-size: 1.2rem;
  font-weight: bold;
}

.deal-desc {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: #6c757d;
  font-size: 0.9rem;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
  width: 100%;
}

.btn-primary:hover {
  background-color: #3f37c9;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .forecast-item {
    grid-template-columns: 1fr;
    gap: 5px;
  }
}
</style>
