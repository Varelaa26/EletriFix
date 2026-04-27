import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Permitir CORS simples (ajuste origin conforme necessário em produção)
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.static('.'));

let db;

async function initDb() {
  db = await open({ filename: './produtos.db', driver: sqlite3.Database });
  await db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    preco REAL,
    descricao TEXT,
    quantidade INTEGER,
    imagem TEXT
  )`);
}

app.get('/api/produtos', async (req, res) => {
  try {
    const produtos = await db.all('SELECT * FROM produtos ORDER BY id DESC');
    res.json(produtos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.post('/api/produtos', async (req, res) => {
  try {
    const { nome, preco, descricao, quantidade, imagem } = req.body;
    const result = await db.run(
      'INSERT INTO produtos (nome, preco, descricao, quantidade, imagem) VALUES (?, ?, ?, ?, ?)',
      [nome, preco, descricao, quantidade, imagem]
    );
    const produto = await db.get('SELECT * FROM produtos WHERE id = ?', [result.lastID]);
    res.status(201).json(produto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

app.put('/api/produtos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, preco, descricao, quantidade, imagem } = req.body;
    await db.run(
      'UPDATE produtos SET nome = ?, preco = ?, descricao = ?, quantidade = ?, imagem = ? WHERE id = ?',
      [nome, preco, descricao, quantidade, imagem, id]
    );
    const produto = await db.get('SELECT * FROM produtos WHERE id = ?', [id]);
    res.json(produto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

app.delete('/api/produtos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.run('DELETE FROM produtos WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

  initDb()
  .then(() => {
    // escutar em 0.0.0.0 para aceitar conexões externas quando hospedado
    app.listen(PORT, '0.0.0.0', () => console.log('Server running on port ' + PORT));
  })
  .catch((err) => {
    console.error('Erro ao iniciar o banco:', err);
    process.exit(1);
  });