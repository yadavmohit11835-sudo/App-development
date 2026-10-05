const db = require('../config/db');

exports.getAllPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let query = `
      SELECT p.*, c.shop_name as customer_shop_name, u.full_name as recorded_by_name, s.plan_name
      FROM payments p
      JOIN customers c ON p.customer_id = c.id
      JOIN users u ON p.recorded_by_user_id = u.id
      LEFT JOIN subscriptions s ON p.subscription_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (!isAdmin) {
      query += ' AND p.recorded_by_user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY p.payment_date DESC, p.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

exports.recordPayment = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customer_id,
      subscription_id,
      amount_paid,
      payment_date,
      payment_method,
      reference_number,
      notes,
    } = req.body;

    const parsedAmount = parseFloat(amount_paid);
    if (!customer_id || isNaN(parsedAmount) || parsedAmount <= 0) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Valid customer and positive payment amount are required.',
      });
    }

    // Verify customer exists
    const [custRows] = await connection.query('SELECT id, shop_name FROM customers WHERE id = ?', [
      customer_id,
    ]);
    if (custRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Customer account not found.' });
    }

    // Prevent duplicate payment entry if same reference number within 24 hours
    if (reference_number) {
      const [dupRows] = await connection.query(
        `SELECT id FROM payments 
         WHERE reference_number = ? AND customer_id = ? AND status = 'verified' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
        [reference_number.trim(), customer_id]
      );
      if (dupRows.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          message: 'A payment with this exact reference number has already been recorded recently.',
        });
      }
    }

    // Record the payment
    const [result] = await connection.query(
      `INSERT INTO payments (
         customer_id, subscription_id, recorded_by_user_id, amount_paid,
         payment_date, payment_method, reference_number, notes, status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'verified')`,
      [
        customer_id,
        subscription_id || null,
        req.user.id,
        parsedAmount,
        payment_date || new Date().toISOString().split('T')[0],
        payment_method || 'upi',
        reference_number ? reference_number.trim() : null,
        notes ? notes.trim() : null,
      ]
    );

    // Calculate updated subscription balance if linked
    let updatedBalance = 0;
    if (subscription_id) {
      const [subRows] = await connection.query(
        `SELECT s.total_amount, COALESCE(SUM(p.amount_paid), 0) as total_paid
         FROM subscriptions s
         LEFT JOIN payments p ON s.id = p.subscription_id AND p.status = 'verified'
         WHERE s.id = ?
         GROUP BY s.id`,
        [subscription_id]
      );

      if (subRows.length > 0) {
        const total = parseFloat(subRows[0].total_amount) || 0;
        const paid = parseFloat(subRows[0].total_paid) || 0;
        updatedBalance = Math.max(0, total - paid);
      }
    }

    // Log Activity
    await connection.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
       VALUES (?, 'RECORD_PAYMENT', 'payment', ?, ?)`,
      [
        req.user.id,
        result.insertId,
        `Recorded ₹${parsedAmount} for ${custRows[0].shop_name} via ${payment_method}`,
      ]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment_id: result.insertId,
      amount_paid: parsedAmount,
      remaining_balance: updatedBalance,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};
