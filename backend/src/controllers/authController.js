const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');



exports.signup = async (req, res) => {
  const { username,email,password } = req.body;

  try {
    const existingUser = await User.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.createUser(username, email, hashedPassword);

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log('Login payload:', req.body);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findUserByEmail(email);
    console.log('User found:', user); 
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isValid = await bcrypt.compare(password, user.password);

    

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.verifyToken = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ valid: false });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ valid: false });
    res.json({ valid: true, userId: decoded.userId });
  });
};

