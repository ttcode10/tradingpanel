const express = require('express');
const router = express.Router();
const config = require('config');
const request = require('request');
const { check, validationResult }  = require('express-validator');

const Stock = require('./../../models/Stock');

// @route    GET api/stock/:symbol
// @desc     Get specific stock daily chart by symbol
// @access   Public
router.get('/', (req, res) => res.send('Stock route'));



// @route    GET api/stock/:symbol/chart
// @desc     Get specific stock daily chart
// @access   Public
router.get('/:symbol/chart', async (req, res) => {
  try {
    const options = {
      uri: `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${req.params.symbol}&apikey=${config.get('alphaAdvantageSecret')}`,
      method: 'GET',
      headers: {'user-agent': 'node.js'}
    }

    request(options, (error, response, body) => {
      if(error) console.log(error);
      if(response.statusCode !== 200) {
        return res.status(404).json({message: 'No data found'});
      }
      return res.json(JSON.parse(body));
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Server error');
  }
});


// @route    POST api/stock/:symbol
// @desc     Create stock profile
// @access   Public
router.post('/:symbol', [
    check('symbol', 'Symbol is required').not().isEmpty(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const symbol = req.params.symbol.toLowerCase();

    const stockField = {}
    if(symbol) stockField.symbol = symbol;

    try {
      // See if the stock profile exist
      let stock = await Stock.findOne({symbol});

      // Return the stock profile if exists
      if(stock) {
        return res.json(stock);
      }

      // Create a new stock profile if not exists
      const stockProfile = new Stock(stockField);
      await stockProfile.save();
      return res.json(stockProfile);

    } catch (error) {
      console.log(error.message);
      return res.status(500).send('Server error');
    }
});


// @route    POST api/stock/:symbol/vote/bullish
// @desc     Create bullish vote
// @access   Private
router.post('/:symbol/vote/bullish', async (req, res) => {
  
  
  try {
    // Find the stock to vote
    const stock = await Stock.findById(req.params.symbol);
    
    // Check if voted
    if(stock.bullish.map(item => item.user.toString === req.user.id)) {
      // Alert if voted
      return res.status(400).json({message: 'You already voted'});
    } else {
      // Bullish vote + 1
      const voter = {};
      voter.user = req.user.id;
      voter.name = req.user.name;
      voter.avatar = req.user.avatar;
      voter.date = new Date();
      stock.bullish.unshift(voter);

      await stock.save();
      return res.json(stock.bullish);
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Server error');
  }
})



module.exports  = router;



