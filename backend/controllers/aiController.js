const { Configuration, OpenAIApi } = require("openai"); // Example using OpenAI SDK, adapt for DeepSeek
const dbConfig = require('../config/db.config');
const mysql = require('mysql2/promise');

// Initialize DeepSeek client (replace with actual DeepSeek SDK/config)
// const deepseek = new DeepSeekClient({ apiKey: process.env.DEEPSEEK_API_KEY }); 
// For now, using a mock function
const mockDeepSeekCall = async (prompt) => {
    console.log(`Mock DeepSeek call with prompt: ${prompt}`);
    // Simulate different responses based on prompt content
    if (prompt.includes('analyze lead')) {
        return { tags: ['AI感兴趣', '价格咨询'] }; // Mock response
    } else if (prompt.includes('follow-up')) {
        return { suggestion: '建议发送一份详细的产品手册。' }; // Mock response
    } else if (prompt.includes('quote draft')) {
        return { draft: '尊敬的客户，这是您的报价单...' }; // Mock response
    } else if (prompt.includes('alerts')) {
        return { alerts: [{ type: 'warning', message: '客户C已超过30天未联系，存在流失风险。' }] }; // Mock response
    }
    return {};
};

// Controller for Lead Analysis
const analyzeLead = async (req, res) => {
  try {
    const { name, description } = req.body;
    // Prepare prompt for DeepSeek
    const prompt = `Analyze the following lead information: Name: "${name}", Description: "${description}". Identify key tags like 'price inquiry', 'feature interest', etc.`;

    // Call DeepSeek API (mocked)
    const result = await mockDeepSeekCall(prompt);
    res.json(result);

  } catch (error) {
    console.error('Error analyzing lead:', error);
    res.status(500).json({ error: 'Failed to analyze lead' });
  }
};

// Controller for Follow-up Generation
const generateFollowUp = async (req, res) => {
  try {
    const { customerId } = req.params;
    // Fetch customer's history from DB (simplified query)
    // const connection = await mysql.createConnection(dbConfig);
    // const [rows] = await connection.execute('SELECT notes FROM customers WHERE id = ?', [customerId]);
    // const history = rows[0]?.notes || '';
    // connection.end();

    // Mock history for demo
    const history = 'Initial contact made, expressed interest in features X and Y.';
    const prompt = `Based on the customer history: "${history}", suggest the next follow-up action.`;

    // Call DeepSeek API (mocked)
    const result = await mockDeepSeekCall(prompt);
    res.json(result);

  } catch (error) {
    console.error('Error generating follow-up:', error);
    res.status(500).json({ error: 'Failed to generate follow-up suggestion' });
  }
};

// Controller for Quote Draft Generation
const generateQuoteDraft = async (req, res) => {
  try {
    const { customerName, modules, price } = req.body;
    const prompt = `Generate a professional quote draft for customer "${customerName}" for modules: ${modules.join(', ')}. Total price is ¥${price}.`;

    // Call DeepSeek API (mocked)
    const result = await mockDeepSeekCall(prompt);
    res.json(result);

  } catch (error) {
    console.error('Error generating quote draft:', error);
    res.status(500).json({ error: 'Failed to generate quote draft' });
  }
};

// Controller for checking AI Alerts
const checkForAlerts = async (req, res) => {
  try {
    // Fetch data from DB that might trigger alerts (e.g., inactive customers, overdue payments)
    // const connection = await mysql.createConnection(dbConfig);
    // const [inactiveCustomers] = await connection.execute('SELECT name FROM customers WHERE last_contact_date < DATE_SUB(NOW(), INTERVAL 30 DAY)');
    // connection.end();

    // Mock alert check
    const prompt = `Check for potential sales risks like inactive customers or overdue contracts.`;

    // Call DeepSeek API (mocked)
    const result = await mockDeepSeekCall(prompt);
    res.json(result);

  } catch (error) {
    console.error('Error checking for alerts:', error);
    res.status(500).json({ error: 'Failed to check for alerts' });
  }
};

module.exports = {
  analyzeLead,
  generateFollowUp,
  generateQuoteDraft,
  checkForAlerts
};