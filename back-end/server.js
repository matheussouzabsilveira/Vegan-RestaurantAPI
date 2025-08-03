// server.js

// Importa as bibliotecas necessárias
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config(); // Para carregar variáveis de ambiente do arquivo .env

// Cria a aplicação Express
const app = express();
const port = process.env.PORT || 5000;

// Configurar a conexão com o banco de dados
// A string de conexão é lida de process.env.DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ESTA É A CORREÇÃO PRINCIPAL:
  // Esta configuração é crucial para bases de dados alojadas na cloud como o Render
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware (para habilitar o CORS e processar JSON)
app.use(cors());
app.use(express.json());

// ----- ENDPOINTS DA API -----

/**
 * @description Rota para adicionar um novo pedido ao carrinho.
 * @route POST /orders
 * @body {string} dish_name - O nome do prato.
 * @body {string} ingredients - Os ingredientes do prato.
 * @body {number} quantity - A quantidade do pedido.
 * @body {string} notes - Observações sobre o pedido.
 * @body {string} image_url - A URL da imagem do prato.
 * @body {number} price - O preço do prato.
 */
app.post('/orders', async (req, res) => {
  const { dish_name, ingredients, quantity, notes, image_url, price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO orders (dish_name, ingredients, quantity, notes, image_url, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [dish_name, ingredients, quantity, notes, image_url, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao adicionar pedido:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao adicionar o pedido' });
  }
});

/**
 * @description Rota para buscar todos os pedidos do carrinho.
 * @route GET /orders
 */
app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC;');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao buscar os pedidos' });
  }
});

/**
 * @description Rota para remover um pedido específico do carrinho.
 * @route DELETE /orders/:id
 * @param {number} id - O ID do pedido a ser removido.
 */
app.delete('/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *;', [id]);
    if (result.rowCount > 0) {
      res.json({ message: 'Pedido removido com sucesso.', deletedOrder: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Pedido não encontrado.' });
    }
  } catch (err) {
    console.error('Erro ao remover pedido:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao remover o pedido' });
  }
});

/**
 * @description Rota para finalizar o pedido, removendo todos os itens do carrinho.
 * @route DELETE /orders
 */
app.delete('/orders', async (req, res) => {
  try {
    await pool.query('DELETE FROM orders;');
    res.json({ message: 'Carrinho esvaziado com sucesso.' });
  } catch (err) {
    console.error('Erro ao finalizar pedido:', err);
    res.status(500).json({ error: 'Erro interno do servidor ao finalizar o pedido' });
  }
});

// ---------------------------

// Inicia o servidor na porta definida
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

// // server.js

// // Importa as bibliotecas necessárias
// const express = require('express');
// const { Pool } = require('pg');
// const cors = require('cors');
// require('dotenv').config(); // Para carregar variáveis de ambiente do arquivo .env

// // Cria a aplicação Express
// const app = express();
// const port = process.env.PORT || 5000;

// // Configurar a conexão com o banco de dados
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// // Middleware (para habilitar o CORS e processar JSON)
// app.use(cors());
// app.use(express.json());

// // ----- ENDPOINTS DA API -----

// /**
//  * @description Rota para adicionar um novo pedido ao carrinho.
//  * @route POST /orders
//  * @body {string} dish_name - O nome do prato.
//  * @body {string} ingredients - Os ingredientes do prato.
//  * @body {number} quantity - A quantidade do pedido.
//  * @body {string} notes - Observações sobre o pedido.
//  * @body {string} image_url - A URL da imagem do prato.
//  * @body {number} price - O preço do prato.
//  */
// app.post('/orders', async (req, res) => {
//   // A URL da imagem e o PREÇO são adicionados à desestruturação do corpo da requisição
//   const { dish_name, ingredients, quantity, notes, image_url, price } = req.body;
//   try {
//     const result = await pool.query(
//       'INSERT INTO orders (dish_name, ingredients, quantity, notes, image_url, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
//       [dish_name, ingredients, quantity, notes, image_url, price]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error('Erro ao adicionar pedido:', err);
//     res.status(500).json({ error: 'Erro interno do servidor ao adicionar o pedido' });
//   }
// });

// /**
//  * @description Rota para buscar todos os pedidos do carrinho.
//  * @route GET /orders
//  */
// app.get('/orders', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC;');
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Erro ao buscar pedidos:', err);
//     res.status(500).json({ error: 'Erro interno do servidor ao buscar os pedidos' });
//   }
// });

// /**
//  * @description Rota para remover um pedido específico do carrinho.
//  * @route DELETE /orders/:id
//  * @param {number} id - O ID do pedido a ser removido.
//  */
// app.delete('/orders/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *;', [id]);
//     if (result.rowCount > 0) {
//       res.json({ message: 'Pedido removido com sucesso.', deletedOrder: result.rows[0] });
//     } else {
//       res.status(404).json({ error: 'Pedido não encontrado.' });
//     }
//   } catch (err) {
//     console.error('Erro ao remover pedido:', err);
//     res.status(500).json({ error: 'Erro interno do servidor ao remover o pedido' });
//   }
// });

// /**
//  * @description Rota para finalizar o pedido, removendo todos os itens do carrinho.
//  * @route DELETE /orders
//  */
// app.delete('/orders', async (req, res) => {
//   try {
//     await pool.query('DELETE FROM orders;');
//     res.json({ message: 'Carrinho esvaziado com sucesso.' });
//   } catch (err) {
//     console.error('Erro ao finalizar pedido:', err);
//     res.status(500).json({ error: 'Erro interno do servidor ao finalizar o pedido' });
//   }
// });

// // ---------------------------

// // Inicia o servidor na porta definida
// app.listen(port, () => {
//   console.log(`Servidor rodando em http://localhost:${port}`);
// });