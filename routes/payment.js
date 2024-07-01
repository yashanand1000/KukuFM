const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const payment = require('../controllers/payment');
const { emailVerified, isLoggedIn } = require('../middleware');

const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.route('/createOrder')
    .post(isLoggedIn, emailVerified, (payment.createOrder));

router.route('/verifyPayment')
    .post(isLoggedIn, emailVerified, (payment.verifyPayment));

module.exports = router;