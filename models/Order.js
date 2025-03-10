const db = require('../config/db');

class Order {
  static async create(customerId, restaurantId, totalPrice, deliveryAddress, items) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Create order
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (customer_id, restaurant_id, total_price, delivery_address) VALUES (?, ?, ?, ?)',
        [customerId, restaurantId, totalPrice, deliveryAddress]
      );
      
      const orderId = orderResult.insertId;
      
      // Add order items
      for (const item of items) {
        await connection.execute(
          'INSERT INTO order_items (order_id, dish_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.dishId, item.quantity, item.price]
        );
      }
      
      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating order: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    try {
      const [orders] = await db.execute(
        'SELECT o.*, u.name as customer_name FROM orders o ' +
        'JOIN users u ON o.customer_id = u.id ' +
        'WHERE o.id = ?',
        [id]
      );
      
      if (orders.length === 0) return null;
      
      const order = orders[0];
      
      // Get order items
      const [items] = await db.execute(
        'SELECT oi.*, d.name, d.description, d.category FROM order_items oi ' +
        'JOIN dishes d ON oi.dish_id = d.id ' +
        'WHERE oi.order_id = ?',
        [id]
      );
      
      order.items = items;
      return order;
    } catch (error) {
      throw new Error(`Error finding order: ${error.message}`);
    }
  }

  static async findByCustomerId(customerId) {
    try {
      const [orders] = await db.execute(
        'SELECT o.*, u.name as restaurant_name FROM orders o ' +
        'JOIN users u ON o.restaurant_id = u.id ' +
        'WHERE o.customer_id = ? ' +
        'ORDER BY o.created_at DESC',
        [customerId]
      );
      
      return orders;
    } catch (error) {
      throw new Error(`Error finding customer orders: ${error.message}`);
    }
  }

  static async findByRestaurantId(restaurantId) {
    try {
      const [orders] = await db.execute(
        'SELECT o.*, u.name as customer_name FROM orders o ' +
        'JOIN users u ON o.customer_id = u.id ' +
        'WHERE o.restaurant_id = ? ' +
        'ORDER BY o.created_at DESC',
        [restaurantId]
      );
      
      return orders;
    } catch (error) {
      throw new Error(`Error finding restaurant orders: ${error.message}`);
    }
  }

  static async updateStatus(id, status) {
    try {
      const [result] = await db.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }
}

module.exports = Order;