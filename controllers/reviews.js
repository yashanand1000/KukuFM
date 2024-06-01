const Audiobook = require('../models/audiobook');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const audiobook = await Audiobook.findById(req.params.id).populate('reviews');
    const { review: newReviewData } = req.body;
    const existingReview = audiobook.reviews.find(r => r.author.equals(req.user._id));

    if (existingReview) {
        // Update the existing review
        existingReview.rating = newReviewData.rating;
        existingReview.body = newReviewData.body;
        await existingReview.save();
        req.flash('success', 'Updated your review!');
    } else {
        // Create a new review
        const review = new Review(newReviewData);
        review.author = req.user._id;
        audiobook.reviews.push(review);
        await review.save();
        await audiobook.save();
        req.flash('success', 'Created new review!');
    }

    res.redirect(`/audiobooks/${audiobook._id}`);
};


module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Audiobook.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/audiobooks/${id}`);
}
