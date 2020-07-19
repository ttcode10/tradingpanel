const express = require('express');
const router = express.Router();
const config = require('config');
const request = require('request');
const { response } = require('express');


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


// @route    GET api/stock/:symbol/votes
// @desc     Get bullish & bearish votes on specific stock
// @access   Public
router.get('/:symbol/votes', async (req, res) => {
  try {
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



module.exports  = router;



