const express = require('express');
const router = express.Router();
const educationModuleController = require('../controllers/education-module-controller');

router.get('/', educationModuleController.getAll);
router.post('/', educationModuleController.create);
router.put('/:id', educationModuleController.update);
router.delete('/:id', educationModuleController.delete);

module.exports = router;
