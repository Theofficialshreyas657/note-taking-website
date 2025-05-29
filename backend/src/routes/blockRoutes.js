
const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController');
router.get('/all', blockController.getAllBlocks);
router.get('/', blockController.getUserBlocks);
router.get('/:id', blockController.getBlockById);
router.post('/', blockController.createBlock);
router.put('/:id', blockController.updateBlock);

router.delete('/:id', blockController.deleteBlock);

module.exports = router;