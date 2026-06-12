<template>
  <div class="ai-analysis-container">
    <h1>AI智能分析</h1>
    <div class="analysis-options">
      <div class="card">
        <h3>📊 销售趋势分析</h3>
        <p>分析销售数据趋势，预测未来业绩</p>
        <button class="btn btn-primary">开始分析</button>
      </div>
      <div class="card">
        <h3>👥 客户价值评估</h3>
        <p>评估客户价值，识别高潜力客户</p>
        <button class="btn btn-primary">开始评估</button>
      </div>
      <div class="card">
        <h3>💡 营销策略建议</h3>
        <p>基于数据分析提供营销策略建议</p>
        <button class="btn btn-primary">获取建议</button>
      </div>
      <div class="card">
        <h3>🎯 成交概率预测</h3>
        <p>预测线索成交概率，优化销售资源分配</p>
        <button class="btn btn-primary">开始预测</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AiAnalysis'
};
</script>

<style scoped>
.ai-analysis-container {
  padding: 0;
  width: 100%;
  height: 100%;
}

.analysis-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.card h3 {
  margin-top: 0;
  color: #2c3e50;
}

.card p {
  color: #7f8c8d;
  margin-bottom: 15px;
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
</style>