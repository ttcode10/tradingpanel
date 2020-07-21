const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult }  = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('./../../middleware/auth');

const User = require('./../../models/User');

// @route    GET api/auth
// @desc     Get user by token
// @access   Private

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Server error');
  }
});


// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public

router.post('/', [
  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email is invalid'),
  check('password')
    .notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()})
  }

  const {email, password} = req.body;

  try {
    // Find user if exists
    const user = await User.findOne({email});
    if(!user) {
      return res.status(400).json({errors: [{message: 'Invalid email or password'}]});
    } else {

      // Compare input password and stored password
      const isMatch = await bcrypt.compare(password, user.password);
      if(!isMatch) {
        return res.status(500).json({errors: [{message: 'Invalid email or password'}]})
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 360000}, (err, token) => {
        if(err) throw err;
        return res.json(token);
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Server error');
  }
});


module.exports = router;
