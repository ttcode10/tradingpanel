const express = require('express');
const router = express.Router();

// @route    GET api/stock
// @desc     Test route
// @access   Public
router.get('/', (req, res) => res.send('Stock route'));

module.exports  = router;

