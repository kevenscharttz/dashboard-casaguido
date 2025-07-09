const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Excluir quimioterapia
router.delete('/quimio/:id', async (req, res) => {
  const id = req.params.id;
  const pool = await db.connect();
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM pcte_quimio WHERE id_quimio = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir quimioterapia:', err);
    res.status(500).json({ error: 'Erro ao excluir quimioterapia', details: err.message });
  } finally {
    client.release();
  }
});

// Excluir radioterapia
router.delete('/radio/:id', async (req, res) => {
  const id = req.params.id;
  const pool = await db.connect();
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM pcte_radio WHERE id_radio = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir radioterapia:', err);
    res.status(500).json({ error: 'Erro ao excluir radioterapia', details: err.message });
  } finally {
    client.release();
  }
});

// Excluir cirurgia
router.delete('/cirurgia/:id', async (req, res) => {
  const id = req.params.id;
  const pool = await db.connect();
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM cirurgia WHERE id_cirurgia = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir cirurgia:', err);
    res.status(500).json({ error: 'Erro ao excluir cirurgia', details: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;

// Excluir medicamento
router.delete('/medicamento/:id', async (req, res) => {
  const id = req.params.id;
  const pool = await db.connect();
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM medicamentos WHERE id_medicamento = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir medicamento:', err);
    res.status(500).json({ error: 'Erro ao excluir medicamento', details: err.message });
  } finally {
    client.release();
  }
});

// Excluir diagnóstico familiar
router.delete('/diagnostico-familia/:id', async (req, res) => {
  const id = req.params.id;
  const pool = await db.connect();
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM resp_diag WHERE id_resp_diag = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir diagnóstico familiar:', err);
    res.status(500).json({ error: 'Erro ao excluir diagnóstico familiar', details: err.message });
  } finally {
    client.release();
  }
});

// Excluir diagnóstico do paciente
router.delete('/diagnostico/:id', async (req, res) => {
  const id = req.params.id;
  const pool = await db.connect();
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM pcte_diag WHERE id_pcte_diag = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir diagnóstico:', err);
    res.status(500).json({ error: 'Erro ao excluir diagnóstico', details: err.message });
  } finally {
    client.release();
  }
});
