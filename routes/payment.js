const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const payment = require('../controllers/payment');
const { isLoggedIn } = require('../middleware');

const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.route('/createOrder')
    .post(isLoggedIn, catchAsync(payment.createOrder));

router.route('/verifyPayment')
    .post(isLoggedIn, catchAsync(payment.verifyPayment));

module.exports = router;