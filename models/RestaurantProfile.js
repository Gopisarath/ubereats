const db = require('../config/db');

class RestaurantProfile {
  static async create(userId, location, cuisine) {
    try {
      // Check if profile already exists for this user
      const [existing] = await db.execute(
        'SELECT * FROM restaurant_profiles WHERE user_id = ?',
        [userId]
      );
      
      if (existing.length > 0) {
        // Profile already exists, update it instead
        return await this.update(userId, null, location, cuisine, null, null, null, null);
      }
      
      // Create new profile if none exists
      const [result] = await db.execute(
        'INSERT INTO restaurant_profiles (user_id, location, cuisine) VALUES (?, ?, ?)',
        [userId, location, cuisine]
      );
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating restaurant profile: ${error.message}`);
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT rp.*, u.name, u.email FROM restaurant_profiles rp ' +
        'JOIN users u ON rp.user_id = u.id ' +
        'WHERE rp.user_id = ?',
        [userId]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error finding restaurant profile: ${error.message}`);
    }
  }

  static async update(userId, description, location, cuisine, openTime, closeTime, deliveryFee, minOrder) {
    try {
      // Build the SQL query dynamically based on provided fields
      let query = 'UPDATE restaurant_profiles SET ';
      const params = [];
      const fields = [];
      
      if (description !== undefined && description !== null) {
        fields.push('description = ?');
        params.push(description);
      }
      
      if (location !== undefined && location !== null) {
        fields.push('location = ?');
        params.push(location);
      }
      
      if (cuisine !== undefined && cuisine !== null) {
        fields.push('cuisine = ?');
        params.push(cuisine);
      }
      
      if (openTime !== undefined && openTime !== null) {
        fields.push('open_time = ?');
        params.push(openTime);
      }
      
      if (closeTime !== undefined && closeTime !== null) {
        fields.push('close_time = ?');
        params.push(closeTime);
      }
      
      if (deliveryFee !== undefined && deliveryFee !== null) {
        fields.push('delivery_fee = ?');
        params.push(deliveryFee);
      }
      
      if (minOrder !== undefined && minOrder !== null) {
        fields.push('min_order = ?');
        params.push(minOrder);
      }
      
      // Return early if no fields to update
      if (fields.length === 0) {
        return true;
      }
      
      query += fields.join(', ') + ' WHERE user_id = ?';
      params.push(userId);
      
      const [result] = await db.execute(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating restaurant profile: ${error.message}`);
    }
  }

  static async updateImage(userId, image) {
    try {
      const [result] = await db.execute(
        'UPDATE restaurant_profiles SET image = ? WHERE user_id = ?',
        [image, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating restaurant image: ${error.message}`);
    }
  }

  static async getAll() {
    try {
      const [rows] = await db.execute(
        'SELECT rp.*, u.id as restaurant_id, u.name, u.email FROM restaurant_profiles rp ' +
        'JOIN users u ON rp.user_id = u.id ' +
        'WHERE u.role = "restaurant"'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error getting all restaurants: ${error.message}`);
    }
  }
}

module.exports = RestaurantProfile;