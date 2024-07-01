const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/payment')


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

module.exports.createOrder = async (req, res) => {
    const { amount, currency, receipt } = req.body;
    //console.log(currency);
    try {
        const order = await razorpay.orders.create({ amount, currency, receipt });
        res.json(order);
    } catch (error) {
        res.status(500).send({ error: 'Error creating order' });
    }
};

module.exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
        const payment = new Payment({
            user: req.user._id,
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            amount: req.body.amount,
            currency: req.body.currency,
            status: 'success'
        });
        await payment.save();

        // Update the user's payment status
        req.user.hasPaid = true;
        await req.user.save();

        req.flash('success', 'Payment successful!');
        res.redirect('/audiobooks');
    } else {
        req.flash('error', 'Payment verification failed. Please try again.');
        res.redirect('/audiobooks');
    }
};