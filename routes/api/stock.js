const express = require('express');
const router = express.Router();
const config = require('config');
const request = require('request');
const { check, validationResult }  = require('express-validator');
const auth = require('./../../middleware/auth');

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



// @route    GET api/stock/:symbol
// @desc     Get stock profile
// @access   Public
router.get('/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  try {
    // See if the stock profile exist
    let stock = await Stock.findOne({symbol});

    // Return the stock profile if exists
    if(stock) {
      return res.json(stock);
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Server error');
  }
});


// @route    POST api/stock/:symbol
// @desc     Create stock profile
// @access   Public
router.post('/:symbol', [
    check('symbol', 'Symbol is required').notEmpty(),
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

// Generic voting function
// const vote = async function(direction, req, res) {
//   try {
//     // Find the stock to vote
//     const stock = await Stock.findOne({symbol: req.params.symbol});

//     // Check if voted
//     const voted = stock.direction.find(item => item.user.toString === req.user.id);
//     if(voted) {
//       // Alert if voted
//       return res.status(400).json({message: 'You already voted'});
//     } else {
//       // Bullish vote + 1
//       const comment = {};
//       comment.user = req.user.id;
//       comment.name = req.user.name;
//       comment.avatar = req.user.avatar;
//       comment.date = new Date();

//       stock.direction.unshift(comment);

//       await stock.save();
//       return res.json(stock);
//     }
//   } catch (error) {
//     console.log(error.message);
//     return res.status(500).send('Server error');
//   }
// }

// @route    POST api/stock/:symbol/vote/bullish
// @desc     Create bullish vote
// @access   Private
router.post('/:symbol/vote/bullish', auth, async (req, res) => {
  try {
    // Find the stock to vote
    const stock = await Stock.findOne({symbol: req.params.symbol});

    // Check if voted
    const voted = stock.bullish.find(item => item.user.toString === req.user.id);
    if(voted) {
      // Alert if voted
      return res.status(400).json({message: 'You already voted'});
    } else {
      // Bullish vote + 1
      const comment = {};
      comment.user = req.user.id;
      comment.name = req.user.name;
      comment.avatar = req.user.avatar;
      comment.date = new Date();

      stock.bullish.unshift(comment);

      await stock.save();
      return res.json(stock);
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Server error');
  }
});




// @route    POST api/stock/:symbol/vote/bearish
// @desc     Create bullish vote
// @access   Private
router.post('/:symbol/vote/bearish', auth, async (req, res) => {
  try {
    // Find the stock to vote
    const stock = await Stock.findOne({symbol: req.params.symbol});

    // Check if voted
    const voted = stock.bearish.find(item => item.user.toString === req.user.id);
    if(voted) {
      // Alert if voted
      return res.status(400).json({message: 'You already voted'});
    } else {
      // Bullish vote + 1
      const comment = {};
      comment.user = req.user.id;
      comment.name = req.user.name;
      comment.avatar = req.user.avatar;
      comment.date = new Date();

      stock.bearish.unshift(comment);

      await stock.save();
      return res.json(stock);
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Server error');
  }
});



// @route    POST api/stock/:symbol/comments
// @desc     Post comments on stock
// @access   Private
router.post('/:symbol/comments', [
    auth,
    [
      check('text').notEmpty().withMessage('Comment content is required')
    ]
  ], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    try {
      // Find the stock to comment
      const stock = await Stock.findOne({symbol: req.params.symbol});

      // Add comment
      const newComment = {};
      newComment.user = req.user.id;
      newComment.name = req.user.name;
      newComment.avatar = req.user.avatar;
      newComment.text = req.body.text
      newComment.date = new Date();

      stock.comments.unshift(newComment);

      await stock.save();
      return res.json(stock);
    } catch (error) {
      console.log(error.message);
      return res.status(500).send('Server error');
    }
});



// @route    Delete api/stock/:symbol/comments/:commentId
// @desc     Delete comment
// @access   Private
router.delete('/:symbol/comments/:commentId', auth, async (req, res) => {

  try {
    // Find the comment to delete
    const stock = await Stock.findOne({symbol: req.params.symbol});
    const deleteComment = await stock.comments.find(item => item.id === req.params.commentId);

    // Check if the comment exists
    if(!deleteComment) {
      return res.status(404).json({message: 'Comment not found'});
    } else if(deleteComment.user.toString() !== req.user.id) {
      // Execute delete if the user is the comment owner
      return res.status(401).json({message: 'Not authorized to delete the comment'})
    } else {
      const removeIndex = stock.comments.findIndex(item => item.id === req.params.commentId);
      await stock.comments.splice(removeIndex, 1);
      await stock.save();
      return res.json(stock);
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send('Server error');
  }
});



module.exports  = router;



