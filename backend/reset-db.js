const mysql = require('mysql2/promise');

async function resetDatabase() {
  try {
    console.log('正在重置数据库...');
    
    // 连接到 MySQL 服务器（不指定数据库）
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'zty0632.'
    });
    
    console.log('✓ 成功连接到 MySQL 服务器');
    
    // 删除并重新创建数据库
    await conn.execute('DROP DATABASE IF EXISTS `ai_sales_manage`');
    console.log('✓ 已删除旧数据库');
    
    await conn.execute('CREATE DATABASE `ai_sales_manage` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✓ 已创建新数据库');
    
    await conn.end();
    
    console.log('\n✅ 数据库重置完成！现在可以重新启动服务器了。');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 重置数据库失败:', error.message);
    process.exit(1);
  }
}

resetDatabase();
