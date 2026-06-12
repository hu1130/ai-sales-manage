<template>
  <div class="ai-insights-container">
    <h1>AI娲炲療</h1>
    <div class="loading" v-if="loading">鍔犺浇涓?..</div>
    <div class="error" v-else-if="error">{{ error }}</div>
    <template v-else>
      <div class="insights-section" v-if="insights.length">
        <h2>鏅鸿兘鍒嗘瀽</h2>
        <div v-for="(insight, index) in insights" :key="index" 
             :class="['alert', `alert-${insight.type}`]">
          <strong>{{ insight.title }}:</strong> {{ insight.content }}
        </div>
      </div>
      <div class="strategy-section" v-if="strategies.length">
        <h2>AI 生成的销售策略</h2>
        <div v-for="(strategy, index) in strategies" :key="index" class="strategy-card">
          <h3>{{ strategy.title }}</h3>
          <ol>
            <li v-for="(step, stepIndex) in strategy.steps" :key="stepIndex">{{ step }}</li>
          </ol>
        </div>
      </div>
      <div class="empty-state" v-if="insights.length === 0 && strategies.length === 0">
        鏆傛棤AI娲炲療鏁版嵁
      </div>
    </template>
  </div>
</template>

<script>
import { api } from '../utils/api';

export default {
  name: 'AiInsights',
  data() {
    return {
      loading: true,
      error: '',
      insights: [],
      strategies: []
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      this.error = '';
      try {
        const response = await api.ai.getInsights();
        if (response && response.ok) {
          const data = await response.json();
          this.insights = data.insights || [];
          this.strategies = data.strategies || [];
        } else {
          this.error = '加载 AI 洞察失败';
        }
      } catch (err) {
        this.error = '加载 AI 洞察失败';
        console.error(err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.ai-insights-container {
  padding: 0;
  width: 100%;
  height: 100%;
}

.insights-section, .strategy-section {
  margin-bottom: 30px;
}

.alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.strategy-card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f8f9fa;
}

.strategy-card h3 {
  margin-top: 0;
  color: #495057;
}
</style>
