const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translation.controller');

router.get('/:lng/:ns', translationController.getTranslations);

module.exports = router;
