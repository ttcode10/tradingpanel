const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('./../../models/User');
const { validationResult } = require('express-validator');


// @route    POST api/user/register
// @desc     User register
// @access   Public
router.post('/register', [
  check('name').notEmpty().withMessage('Name is required'),
  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .custom(value=> {
      return User.findByEmail(value).then(user => {
        if(user) {
          return Promise.reject('Email already in use');
        }
      });
    }),
  check('password')
    .notEmpty().withMessage('Password is required')
    .matches('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$').withMessage('Minimum 6 characters, at least one uppercase letter, one lowercase letter and one number'),
  check('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, {req}) => {
      if(value !== req.body.password) {
        throw new Error('Password confirmation is not match');
      }
    }),
  check('email', 'Email is required').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({errors.array()});
  }

  try {
    const user = await User.findById(email);
    if(user) {
      return res.status(400).json({message: 'User already exists'});
    } else {
      const { name, email, password } = req.body;

      // Get user avatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'g',
        d: 'mm'
      });

      const user = new User({
        name,
        email,
        password,
        avatar
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      user.password = encryptedPassword;

      await user.save();

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {expiresIn: 360000},
        (err, token) => {
          if(err) throw err;
          res.json(token);
        }
      );
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Server error');  }
});

module.exports  = router;

