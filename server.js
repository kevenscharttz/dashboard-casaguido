const express = require('express');
const cors = require('cors');

require('dotenv').config();
const db = require('./db/db'); // Importa a conexão com o banco de dados

// const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

// app.use('/api', authRoutes);

app.get('/clientes', async (req, res) => {
  const clientes = await db.selectCustomer();
  res.json(clientes);
});

app.get('/clientes/:id', async (req, res) => {
  const clientes = await db.selectCustomers(req.params.id);
  res.json(clientes);
});

app.post('/clientes', async (req, res) => {
  await db.insertCustomer(req.body);
  res.sendStatus(201);
});

app.put('/clientes/:id', async (req, res) => {
  await db.updateCustomer(req.params.id, req.body);
  res.sendStatus(200);
}); 

app.delete('/clientes/:id', async (req, res) => {
  const id = req.params.id;
  await db.deleteCustomer(id);
  res.sendStatus(204);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});