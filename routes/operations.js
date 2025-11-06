var express = require('express');
var router = express.Router();
const db = require('../db');

function toTwo(n){ return Number(Number(n).toFixed(2)); }

// POST /operations
router.post('/', async function(req, res) {
  const { gross_value, receiver_id } = req.body;
  if (!gross_value || !receiver_id) return res.status(400).json({ error: 'gross_value and receiver_id are required' });
  const gross = parseFloat(gross_value);
  if (isNaN(gross) || gross <= 0) return res.status(400).json({ error: 'gross_value must be positive' });
  const fee = toTwo(gross * 0.03);
  const net_value = toTwo(gross - fee);
  try {
    const result = await db.query(
      `INSERT INTO operations (receiver_id, gross_value, fee, net_value, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [receiver_id, gross, fee, net_value]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /operations error:', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

// GET /operations/:id
router.get('/:id', async function(req, res) {
  const id = req.params.id;
  try {
    const result = await db.query(
      `SELECT o.*, r.name AS receiver_name, r.balance AS receiver_balance
       FROM operations o
       LEFT JOIN receivers r ON r.id = o.receiver_id
       WHERE o.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Operation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /operations/:id error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /operations/:id/confirm
router.post('/:id/confirm', async function(req, res) {
  const id = req.params.id;
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const opRes = await client.query('SELECT * FROM operations WHERE id = $1 FOR UPDATE', [id]);
    if (opRes.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Operation not found' }); }
    const op = opRes.rows[0];
    if (op.status === 'confirmed') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Operation already confirmed' }); }
    await client.query("UPDATE operations SET status='confirmed' WHERE id=$1", [id]);
    if (op.receiver_id) {
      await client.query(
        `UPDATE receivers SET balance = COALESCE(balance,0) + $1 WHERE id = $2`,
        [op.net_value, op.receiver_id]
      );
    }
    await client.query('COMMIT');
    const updated = await db.query('SELECT * FROM operations WHERE id = $1', [id]);
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('POST /operations/:id/confirm error:', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  } finally {
    client.release();
  }
});

module.exports = router;