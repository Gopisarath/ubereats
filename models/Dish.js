const db = require('../config/db');

class Dish {
  static async create(restaurantId, name, description, price, category, image) {
    try {
      const [result] = await db.execute(
        'INSERT INTO dishes (restaurant_id, name, description, price, category, image) VALUES (?, ?, ?, ?, ?, ?)',
        [restaurantId, name, description, price, category, image]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating dish: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM dishes WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error finding dish: ${error.message}`);
    }
  }

  static async findByRestaurantId(restaurantId) {
    try {
      const [rows] = await db.execute('SELECT * FROM dishes WHERE restaurant_id = ?', [restaurantId]);
      return rows;
    } catch (error) {
      throw new Error(`Error finding dishes: ${error.message}`);
    }
  }

  static async update(id, name, description, price, category, image, isAvailable) {
    try {
      const [result] = await db.execute(
        'UPDATE dishes SET name = ?, description = ?, price = ?, category = ?, image = ?, is_available = ? WHERE id = ?',
        [name, description, price, category, image, isAvailable, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating dish: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM dishes WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting dish: ${error.message}`);
    }
  }
}

module.exports = Dish;