const db = require('../config/db');

exports.getAllDemos = async (req, res, next) => {
  try {
    const { status, range } = req.query;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let query = `
      SELECT d.*, c.shop_name as customer_shop_name, c.owner_name as customer_owner_name, c.phone as customer_phone, u.full_name as salesperson_name
      FROM demos d
      JOIN customers c ON d.customer_id = c.id
      JOIN users u ON d.salesperson_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (!isAdmin) {
      query += ' AND d.salesperson_id = ?';
      params.push(userId);
    }

    if (status && status !== 'all') {
      query += ' AND d.status = ?';
      params.push(status);
    }

    if (range === 'today') {
      query += ' AND d.demo_date = CURDATE()';
    } else if (range === 'week') {
      query += ' AND d.demo_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (range === 'month') {
      query += ' AND d.demo_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    query += ' ORDER BY d.demo_date DESC, d.demo_time DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.createDemo = async (req, res, next) => {
  try {
    const {
      customer_id,
      salesperson_id,
      demo_date,
      demo_time,
      location,
      notes,
      follow_up_date,
    } = req.body;

    if (!customer_id || !demo_date || !demo_time || !location) {
      return res.status(400).json({
        message: 'Customer, date, time, and location are required.',
      });
    }

    const repId = req.user.role === 'admin' ? (salesperson_id || req.user.id) : req.user.id;

    const [result] = await db.query(
      `INSERT INTO demos (customer_id, salesperson_id, demo_date, demo_time, location, notes, follow_up_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [
        customer_id,
        repId,
        demo_date,
        demo_time,
        location.trim(),
        notes || null,
        follow_up_date || null,
      ]
    );

    // Update customer status to 'demo_scheduled' if currently a lead
    await db.query(
      `UPDATE customers SET status = 'demo_scheduled' WHERE id = ? AND status = 'lead'`,
      [customer_id]
    );

    res.status(201).json({
      message: 'Demo scheduled successfully',
      id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDemoStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, outcome } = req.body;

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid demo status.' });
    }

    const [result] = await db.query(
      `UPDATE demos SET status = ?, outcome = COALESCE(?, outcome) WHERE id = ?`,
      [status, outcome || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Demo not found.' });
    }

    res.json({ message: 'Demo status updated successfully' });
  } catch (error) {
    next(error);
  }
};
