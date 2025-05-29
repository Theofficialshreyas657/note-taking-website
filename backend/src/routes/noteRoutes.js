
const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);
router.patch('/:id/toggle', noteController.toggleCheckbox);

module.exports = router;