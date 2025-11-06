var express = require('express');
var router = express.Router();
const db = require('../db');

// GET /receivers/:id
router.get('/:id', async function(req, res) {
  const id = req.params.id;
  try {
    const rec = await db.query('SELECT id, name, email, balance FROM receivers WHERE id = $1', [id]);
    if (rec.rows.length === 0) return res.status(404).json({ error: 'Receiver not found' });
    const ops = await db.query('SELECT * FROM operations WHERE receiver_id = $1 ORDER BY created_at DESC', [id]);
    res.json({ receiver: rec.rows[0], operations: ops.rows });
  } catch (err) {
    console.error('GET /receivers/:id error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /receivers
router.post('/', async function(req, res) {
  const { name, email } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const result = await db.query(
      'INSERT INTO receivers (name, email, balance) VALUES ($1, $2, 0) RETURNING id, name, email, balance',
      [name, email || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /receivers error:', err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
});

module.exports = router;