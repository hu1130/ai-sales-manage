const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function simpleSeed() {
  try {
    console.log('正在初始化数据库...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'zty0632.',
      database: 'ai_sales_manage'
    });
    
    console.log('✓ 已连接到数据库');
    
    // 1. 创建用户表
    console.log('正在创建用户表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 2. 创建客户表
    console.log('正在创建客户表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 3. 创建报价表
    console.log('正在创建报价表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        amount DECIMAL(15,2),
        items TEXT,
        status VARCHAR(50) DEFAULT '草稿',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 4. 创建合同表
    console.log('正在创建合同表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quote_id INT,
        customer_id INT NOT NULL,
        amount DECIMAL(15,2),
        status VARCHAR(50) DEFAULT '草稿',
        signed_date TIMESTAMP NULL,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✓ 表已创建');
    
    // 插入用户
    console.log('正在插入用户...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('123456', 10);
    
    await connection.execute(
      'INSERT INTO users (username, password, name, email, phone) VALUES (?, ?, ?, ?, ?)',
      ['admin', hashedPassword, '管理员', 'admin@example.com', '13800138000']
    );
    
    await connection.execute(
      'INSERT INTO users (username, password, name, email, phone) VALUES (?, ?, ?, ?, ?)',
      ['manager_zhang', userPassword, '张经理', 'zhang@example.com', '13800138001']
    );
    
    await connection.execute(
      'INSERT INTO users (username, password, name, email, phone) VALUES (?, ?, ?, ?, ?)',
      ['sales_li', userPassword, '李销售', 'li@example.com', '13800138002']
    );
    
    console.log('✓ 用户已插入');
    
    // 插入客户
    console.log('正在插入客户...');
    await connection.execute(
      'INSERT INTO customers (name, company, email, phone) VALUES (?, ?, ?, ?)',
      ['张三公司', 'ABC科技', 'zhangsan@abctech.com', '13900000001']
    );
    
    await connection.execute(
      'INSERT INTO customers (name, company, email, phone) VALUES (?, ?, ?, ?)',
      ['李四公司', 'XYZ贸易', 'lisi@xyztrade.com', '13900000002']
    );
    
    console.log('✓ 客户已插入');
    
    // 插入报价
    console.log('正在插入报价...');
    const [customers] = await connection.execute('SELECT * FROM customers');
    const [users] = await connection.execute('SELECT * FROM users');
    
    const userMap = {};
    users.forEach(u => userMap[u.username] = u.id);
    
    await connection.execute(
      'INSERT INTO quotes (customer_id, amount, items, status, created_by) VALUES (?, ?, ?, ?, ?)',
      [customers[0].id, 100000, '[{"name":"产品A","qty":1,"price":100000}]', '已接受', userMap['sales_li']]
    );
    
    await connection.execute(
      'INSERT INTO quotes (customer_id, amount, items, status, created_by) VALUES (?, ?, ?, ?, ?)',
      [customers[1].id, 200000, '[{"name":"产品B","qty":2,"price":100000}]', '已接受', userMap['sales_li']]
    );
    
    console.log('✓ 报价已插入');
    
    // 插入合同
    console.log('正在插入合同...');
    const [quotes] = await connection.execute('SELECT * FROM quotes');
    
    await connection.execute(
      'INSERT INTO contracts (quote_id, customer_id, amount, status, signed_date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [quotes[0].id, customers[0].id, 100000, '已签署', new Date(), userMap['sales_li']]
    );
    
    await connection.execute(
      'INSERT INTO contracts (quote_id, customer_id, amount, status, signed_date, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [quotes[1].id, customers[1].id, 200000, '已签署', new Date(), userMap['sales_li']]
    );
    
    console.log('✓ 合同已插入');
    
    await connection.end();
    console.log('\n✅ 数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    console.error('完整错误:', error);
    process.exit(1);
  }
}

simpleSeed();
