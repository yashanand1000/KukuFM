const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order_id: String,
    payment_id: String,
    amount: Number,
    currency: String,
    status: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

