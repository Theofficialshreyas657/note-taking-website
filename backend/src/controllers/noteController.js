
const Note = require('../models/note');

exports.createNote = async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Note.update(id, req.body);
    
    if (updated) {
      res.json({ message: 'Note updated successfully' });
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Note.delete(id);
    
    if (deleted) {
      res.json({ message: 'Note deleted successfully' });
    } else {
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

exports.toggleCheckbox = async (req, res) => {
  try {
    const { id } = req.params;
    const { checked } = req.body;
    
    const updated = await Note.toggleCheckbox(id, checked);
    
    if (updated) {
      res.json({ message: 'Checkbox state updated successfully' });
    } else {
      res.status(404).json({ error: 'Note not found or not a checkbox' });
    }
  } catch (error) {
    console.error('Error toggling checkbox:', error);
    res.status(500).json({ error: 'Failed to update checkbox state' });
  }
};