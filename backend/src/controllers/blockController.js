// src/controllers/blockController.js
const jwt = require('jsonwebtoken');
const Block = require('../models/block');
const { v4: uuidv4 } = require('uuid');


exports.getUserBlocks = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Decoded token:', decoded); 
    const userId = decoded.userId; 

    console.log('Fetching blocks for user ID:', userId); 

    const blocks = await Block.getAll(userId); 
    res.json(blocks);
  } catch (err) {
    console.error('Error fetching user blocks:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getAllBlocks = async (req, res) => {
  try {
    const blocks = await Block.getAll(); 
    res.json(blocks);
  } catch (error) {
    console.error('Error getting blocks:', error);
    res.status(500).json({ error: 'Failed to retrieve blocks' });
  }
};


exports.createBlock = async (req, res) => {
  try {
    const { title } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const block = await Block.create({
      id: uuidv4(),
      title,
      user_id: userId 
    });

    res.status(201).json(block);
  } catch (err) {
    console.error('Error creating block:', err);
    res.status(500).json({ message: 'Failed to create block' });
  }
};

exports.updateBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Block.update(id, req.body);
    
    if (updated) {
      res.json({ message: 'Block updated successfully' });
    } else {
      res.status(404).json({ error: 'Block not found' });
    }
  } catch (error) {
    console.error('Error updating block:', error);
    res.status(500).json({ error: 'Failed to update block' });
  }
};

exports.deleteBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Block.delete(id);
    
    if (deleted) {
      res.json({ message: 'Block deleted successfully' });
    } else {
      res.status(404).json({ error: 'Block not found' });
    }
  } catch (error) {
    console.error('Error deleting block:', error);
    res.status(500).json({ error: 'Failed to delete block' });
  }
};

exports.getBlockById = async (req, res) => {
  try {
    const { id } = req.params;
    const block = await Block.getById(id);
    
    if (block) {
      res.json(block);
    } else {
      res.status(404).json({ error: 'Block not found' });
    }
  } catch (error) {
    console.error('Error getting block:', error);
    res.status(500).json({ error: 'Failed to retrieve block' });
  }
};
