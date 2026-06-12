const mysql = require('mysql2/promise');
const dbConfig = require('./config/db.config');

function getServerConfig() {
  const { database, waitForConnections, connectionLimit, queueLimit, ...serverConfig } = dbConfig;
  return serverConfig;
}

function printConnectionHint(error) {
  if (error.code === 'ECONNREFUSED') {
    console.error(`MySQL is not reachable at ${dbConfig.host}:${dbConfig.port}. Start MySQL or change DB_HOST/DB_PORT.`);
    return;
  }

  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error(`MySQL rejected user "${dbConfig.user}". Check DB_USER/DB_PASSWORD.`);
    return;
  }

  console.error(error.message);
}

async function testConnection() {
  let conn;
  let dbConn;

  try {
    console.log(`Testing MySQL connection: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}`);

    conn = await mysql.createConnection(getServerConfig());
    console.log('Connected to MySQL server.');

    await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database "${dbConfig.database}" exists or was created.`);
    await conn.end();

    dbConn = await mysql.createConnection(dbConfig);
    const [rows] = await dbConn.execute('SELECT DATABASE() AS db, VERSION() AS version');
    console.log(`Connected to database "${rows[0].db}" on MySQL ${rows[0].version}.`);
    await dbConn.end();

    console.log('Database test passed.');
    process.exit(0);
  } catch (error) {
    if (conn) await conn.end().catch(() => {});
    if (dbConn) await dbConn.end().catch(() => {});
    console.error('Database test failed.');
    printConnectionHint(error);
    process.exit(1);
  }
}

testConnection();
