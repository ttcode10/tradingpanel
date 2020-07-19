const express = require('express');
const router = express.Router();
const config = require('config');
const request = require('request');
const { response } = require('express');


// @route    GET api/stock/:symbol
// @desc     Get specific stock daily chart
// @access   Public
router.get('/', (req, res) => res.send('Stock route'));



// @route    GET api/stock/:symbol
// @desc     Get specific stock daily chart
// @access   Public
router.get('/:symbol', async (req, res) => {
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

module.exports  = router;



