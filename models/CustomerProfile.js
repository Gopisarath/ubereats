const db = require('../config/db');

class CustomerProfile {
  static async create(userId) {
    try {
      const [result] = await db.execute(
        'INSERT INTO customer_profiles (user_id) VALUES (?)',
        [userId]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating customer profile: ${error.message}`);
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT cp.*, u.name, u.email FROM customer_profiles cp ' +
        'JOIN users u ON cp.user_id = u.id ' +
        'WHERE cp.user_id = ?',
        [userId]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error finding customer profile: ${error.message}`);
    }
  }

  static async update(userId, phone, address, country, state, city) {
    try {
      const [result] = await db.execute(
        'UPDATE customer_profiles SET phone = ?, address = ?, country = ?, state = ?, city = ? WHERE user_id = ?',
        [phone, address, country, state, city, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating customer profile: ${error.message}`);
    }
  }

  static async updateProfilePicture(userId, profilePicture) {
    try {
      const [result] = await db.execute(
        'UPDATE customer_profiles SET profile_picture = ? WHERE user_id = ?',
        [profilePicture, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating profile picture: ${error.message}`);
    }
  }
}

module.exports = CustomerProfile;