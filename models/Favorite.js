const db = require('../config/db');

class Favorite {
  static async add(customerId, restaurantId) {
    try {
      // Check if already a favorite
      const [existing] = await db.execute(
        'SELECT * FROM favorites WHERE customer_id = ? AND restaurant_id = ?',
        [customerId, restaurantId]
      );
      
      if (existing.length > 0) {
        return true; // Already a favorite
      }
      
      const [result] = await db.execute(
        'INSERT INTO favorites (customer_id, restaurant_id) VALUES (?, ?)',
        [customerId, restaurantId]
      );
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Error adding favorite: ${error.message}`);
    }
  }

  static async remove(customerId, restaurantId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM favorites WHERE customer_id = ? AND restaurant_id = ?',
        [customerId, restaurantId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error removing favorite: ${error.message}`);
    }
  }

  static async findByCustomerId(customerId) {
    try {
      const [rows] = await db.execute(
        'SELECT f.*, u.name as restaurant_name, rp.cuisine, rp.image ' +
        'FROM favorites f ' +
        'JOIN users u ON f.restaurant_id = u.id ' +
        'LEFT JOIN restaurant_profiles rp ON f.restaurant_id = rp.user_id ' +
        'WHERE f.customer_id = ?',
        [customerId]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Error finding favorites: ${error.message}`);
    }
  }

  static async isFavorite(customerId, restaurantId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM favorites WHERE customer_id = ? AND restaurant_id = ?',
        [customerId, restaurantId]
      );
      
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error checking favorite: ${error.message}`);
    }
  }
}

module.exports = Favorite;