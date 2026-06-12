const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dbConfig = require('./config/db.config');

function serverConfig() {
  const { database, waitForConnections, connectionLimit, queueLimit, ...config } = dbConfig;
  return config;
}

async function initMysql() {
  let serverConn;
  let conn;

  try {
    console.log(`Connecting to MySQL at ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}...`);
    serverConn = await mysql.createConnection(serverConfig());
    await serverConn.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await serverConn.end();

    conn = await mysql.createConnection(dbConfig);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        email VARCHAR(255),
        phone VARCHAR(50),
        avatar VARCHAR(255),
        role_codes JSON,
        manager_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        status VARCHAR(50),
        source VARCHAR(100),
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        lead_id INT NULL,
        created_by INT,
        extra JSON,
        ai_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        amount DECIMAL(15,2),
        items JSON,
        status VARCHAR(50),
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quote_id INT NULL,
        customer_id INT NOT NULL,
        amount DECIMAL(15,2),
        status VARCHAR(50),
        signed_date DATETIME NULL,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS call_analyses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        job_id VARCHAR(100) UNIQUE,
        customer_id INT NOT NULL,
        user_id INT,
        audio JSON,
        transcript JSON,
        analysis JSON,
        status VARCHAR(50),
        created_at DATETIME,
        completed_at DATETIME NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [userRows] = await conn.execute('SELECT COUNT(*) AS total FROM users');
    if (userRows[0].total === 0) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const userPassword = await bcrypt.hash('123456', 10);
      await conn.execute(
        'INSERT INTO users (username, password, name, email, phone, role_codes) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', adminPassword, '管理员', 'admin@aisales.local', '13800138000', JSON.stringify(['ADMIN'])]
      );
      await conn.execute(
        'INSERT INTO users (username, password, name, email, phone, role_codes, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['manager_chen', userPassword, '陈明', 'chen.ming@aisales.local', '13800138001', JSON.stringify(['SALES_MANAGER']), null]
      );
      await conn.execute(
        'INSERT INTO users (username, password, name, email, phone, role_codes, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['sales_lin', userPassword, '林悦', 'lin.yue@aisales.local', '13800138002', JSON.stringify(['SALES_REP']), 2]
      );
      await conn.execute(
        'INSERT INTO users (username, password, name, email, phone, role_codes, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['sales_zhou', userPassword, '周航', 'zhou.hang@aisales.local', '13800138003', JSON.stringify(['SALES_REP']), 2]
      );
      await conn.execute(
        'INSERT INTO users (username, password, name, email, phone, role_codes, manager_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['viewer_qi', userPassword, '齐思', 'qi.si@aisales.local', '13800138004', JSON.stringify(['VIEWER']), null]
      );
    }

    console.log(`MySQL database "${dbConfig.database}" is ready.`);
    await conn.end();
    process.exit(0);
  } catch (error) {
    if (serverConn) await serverConn.end().catch(() => {});
    if (conn) await conn.end().catch(() => {});
    console.error('MySQL initialization failed.');
    console.error(error.message);
    process.exit(1);
  }
}

initMysql();
