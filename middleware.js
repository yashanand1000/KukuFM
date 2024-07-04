const { audiobookSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Audiobook = require('./models/audiobook');
const Review = require('./models/review');
const User = require('./models/user')

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        console.log(req.session.returnTo)
        req.flash('error', 'You must be signed in first!');
        
        return res.redirect('/login');
    }
    next();
}

module.exports.emailVerified = async(req, res, next) => {
    const user = await User.findOne({ username: req.body.username });
    
    
    if (user.emailVerified) {
        return next();
    }
    req.flash('error', 'You need to verify your email first. Please check your email inbox which is sent during registration');
    res.redirect('/login');
    
}

module.exports.validateAudiobook = (req, res, next) => {
    const { error } = audiobookSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const audiobook = await Audiobook.findById(id);
    if (!audiobook.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/audiobooks/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/audiobooks/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}