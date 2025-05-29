
const db = require('../config/db');

exports.createUser = async (username, email, password) => {
  const [result] = await db.execute(
    'INSERT INTO users (name,email, password) VALUES (?,?, ?)',
    [username, ,email ,password]
  );
  return result;
};

exports.findUserByEmail = async (email) => {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
};

exports.findUserByUsername = async (username) => {
  const [rows] = await db.execute(
    'SELECT * FROM users WHERE name = ?',
    [username]
  );
  return rows[0];
};