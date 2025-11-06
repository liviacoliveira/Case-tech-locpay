// db.js
require('dotenv').config();
const { Pool } = require('pg');

console.log('Tentando conectar ao banco com URL:', process.env.SUPABASE_DB_URL);

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Teste de conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro na conexão com o banco:', err.message);
  } else {
    console.log('Conexão com o banco estabelecida!');
  }
});

// Criar tabelas se não existirem
async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS receivers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS operations (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        receiver_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (receiver_id) REFERENCES receivers (id)
      );
    `);
    console.log('Tabelas criadas com sucesso');
  } catch (err) {
    console.error('Erro ao criar tabelas:', err);
  }
}

createTables();

module.exports = pool;
