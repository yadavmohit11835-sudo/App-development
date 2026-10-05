const db = require('../config/db');

exports.getStats = async (req, res, next) => {
  try {
    const { range } = req.query; // 'today', 'week', 'month', 'all'
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const todayStr = new Date().toISOString().split('T')[0];

    // Build date filter clause for payments / activities
    let paymentDateCondition = '1=1';
    const paramsPayments = [];
    if (range === 'today') {
      paymentDateCondition = 'payment_date = ?';
      paramsPayments.push(todayStr);
    } else if (range === 'week') {
      paymentDateCondition = 'payment_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (range === 'month') {
      paymentDateCondition = 'payment_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    // Role-based customer filter
    const customerFilter = isAdmin ? '1=1' : 'assigned_salesperson_id = ?';
    const customerParams = isAdmin ? [] : [userId];

    // 1. Today's Demos
    const demoFilter = isAdmin
      ? 'demo_date = ?'
      : 'demo_date = ? AND salesperson_id = ?';
    const demoParams = isAdmin ? [todayStr] : [todayStr, userId];
    const [demoCountRows] = await db.query(
      `SELECT COUNT(*) as count FROM demos WHERE ${demoFilter}`,
      demoParams
    );
    const today_demos = demoCountRows[0].count;

    // 2. Total Customers
    const [customerCountRows] = await db.query(
      `SELECT COUNT(*) as count FROM customers WHERE ${customerFilter}`,
      customerParams
    );
    const total_customers = customerCountRows[0].count;

    // 3. Active Subscriptions
    const subFilter = isAdmin
      ? "status = 'active'"
      : "status = 'active' AND customer_id IN (SELECT id FROM customers WHERE assigned_salesperson_id = ?)";
    const subParams = isAdmin ? [] : [userId];
    const [subCountRows] = await db.query(
      `SELECT COUNT(*) as count FROM subscriptions WHERE ${subFilter}`,
      subParams
    );
    const active_subscriptions = subCountRows[0].count;

    // 4. Collections
    const payFilter = isAdmin
      ? `${paymentDateCondition} AND status = 'verified'`
      : `${paymentDateCondition} AND status = 'verified' AND recorded_by_user_id = ?`;
    const payParams = isAdmin ? [...paramsPayments] : [...paramsPayments, userId];
    const [collectionRows] = await db.query(
      `SELECT COALESCE(SUM(amount_paid), 0) as total FROM payments WHERE ${payFilter}`,
      payParams
    );
    const monthly_collections = parseFloat(collectionRows[0].total) || 0;

    // 5. Outstanding dues calculation
    const [outstandingRows] = await db.query(
      `SELECT 
         COALESCE(SUM(s.total_amount), 0) - COALESCE(SUM(p.paid), 0) AS total_outstanding
       FROM subscriptions s
       LEFT JOIN (
         SELECT subscription_id, SUM(amount_paid) as paid 
         FROM payments 
         WHERE status = 'verified' 
         GROUP BY subscription_id
       ) p ON s.id = p.subscription_id
       WHERE s.status IN ('active', 'expiring_soon')`
    );
    const outstanding_total = Math.max(0, parseFloat(outstandingRows[0].total_outstanding) || 0);

    // 6. Expiring soon subscriptions
    const [expiringRows] = await db.query(
      `SELECT COUNT(*) as count FROM subscriptions 
       WHERE status = 'expiring_soon' OR (status = 'active' AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY))`
    );
    const expiring_soon_subscriptions = expiringRows[0].count;

    // 7. Recent Customers
    const [recentCustomers] = await db.query(
      `SELECT c.*, u.full_name as assigned_salesperson_name 
       FROM customers c 
       LEFT JOIN users u ON c.assigned_salesperson_id = u.id 
       WHERE ${customerFilter}
       ORDER BY c.created_at DESC 
       LIMIT 5`,
      customerParams
    );

    // 8. Recent Demos
    const recentDemoFilter = isAdmin ? '1=1' : 'd.salesperson_id = ?';
    const recentDemoParams = isAdmin ? [] : [userId];
    const [recentDemos] = await db.query(
      `SELECT d.*, c.shop_name as customer_shop_name, c.owner_name as customer_owner_name, c.phone as customer_phone, u.full_name as salesperson_name
       FROM demos d
       JOIN customers c ON d.customer_id = c.id
       JOIN users u ON d.salesperson_id = u.id
       WHERE ${recentDemoFilter}
       ORDER BY d.demo_date DESC, d.created_at DESC
       LIMIT 5`,
      recentDemoParams
    );

    // 9. Recent Subscriptions
    const [recentSubs] = await db.query(
      `SELECT s.*, c.shop_name as customer_shop_name, c.owner_name as customer_owner_name,
        COALESCE(p.paid, 0) as amount_paid,
        (s.total_amount - COALESCE(p.paid, 0)) as outstanding_balance
       FROM subscriptions s
       JOIN customers c ON s.customer_id = c.id
       LEFT JOIN (
         SELECT subscription_id, SUM(amount_paid) as paid 
         FROM payments 
         WHERE status = 'verified' 
         GROUP BY subscription_id
       ) p ON s.id = p.subscription_id
       ORDER BY s.created_at DESC
       LIMIT 5`
    );

    // 10. Recent Payments
    const [recentPayments] = await db.query(
      `SELECT p.*, c.shop_name as customer_shop_name, u.full_name as recorded_by_name
       FROM payments p
       JOIN customers c ON p.customer_id = c.id
       JOIN users u ON p.recorded_by_user_id = u.id
       ORDER BY p.payment_date DESC, p.created_at DESC
       LIMIT 5`
    );

    res.json({
      today_demos,
      total_customers,
      active_subscriptions,
      monthly_collections,
      outstanding_total,
      expiring_soon_subscriptions,
      recent_customers: recentCustomers,
      recent_demos: recentDemos,
      recent_subscriptions: recentSubs,
      recent_payments: recentPayments,
    });
  } catch (error) {
    next(error);
  }
};
