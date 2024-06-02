const Audiobook = require('../models/audiobook');
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    console.log(req.query);
    const { genre, title, sort, page = 1, limit = 15 } = req.query;

    const filterOptions = {};
    if (genre) {
        filterOptions.genre = { $in: genre };
    }
    if (title) {
        filterOptions.title = { $regex: title, $options: 'i' };
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let audiobooks = await Audiobook.find(filterOptions)
        .populate('reviews')
        .populate('popupText')
        .skip(skip)
        .limit(parseInt(limit));

    // Calculate total count for pagination
    const count = await Audiobook.countDocuments(filterOptions);

    // Calculate average rating for each audiobook
    audiobooks = audiobooks.map(audiobook => {
        console.log('Reviews for', audiobook.title, ':', audiobook.reviews);
        const totalRatings = audiobook.reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = audiobook.reviews.length ? totalRatings / audiobook.reviews.length : 0;
        return { ...audiobook.toObject(), averageRating };
    });

    // Sort by average rating if requested
    if (sort === 'rating-des') {
        audiobooks = audiobooks.filter(audiobook => typeof audiobook.averageRating === 'number')
            .sort((a, b) => a.averageRating - b.averageRating);
    }

    if (sort === 'rating-asc') {
        audiobooks = audiobooks.filter(audiobook => typeof audiobook.averageRating === 'number')
            .sort((a, b) => b.averageRating - a.averageRating);
    }

    console.log(audiobooks);
    res.render('audiobooks/index', {
        audiobooks,
        current: parseInt(page),
        pages: Math.ceil(count / limit),
        totalItems: count,
        genre,
        title,
        sort
    });
};

module.exports.renderNewForm = (req, res) => {
    res.render('audiobooks/new');
};

module.exports.createAudiobook = async (req, res, next) => {
    const audiobook = new Audiobook(req.body.audiobook);

    audiobook.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    audiobook.author = req.user._id;
    await audiobook.save();
    console.log(audiobook);
    req.flash('success', 'Successfully made a new audiobook!');
    res.redirect(`/audiobooks/${audiobook._id}`);
};

module.exports.showAudiobook = async (req, res) => {
    const audiobook = await Audiobook.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!audiobook) {
        req.flash('error', 'Cannot find that audiobook!');
        return res.redirect('/audiobooks');
    }
    res.render('audiobooks/show', { audiobook });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const audiobook = await Audiobook.findById(id);
    if (!audiobook) {
        req.flash('error', 'Cannot find that audiobook!');
        return res.redirect('/audiobooks');
    }
    res.render('audiobooks/edit', { audiobook });
};

module.exports.updateAudiobook = async (req, res) => {
    const { id } = req.params;
    const audiobook = await Audiobook.findByIdAndUpdate(id, { ...req.body.audiobook });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    audiobook.images.push(...imgs);
    await audiobook.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await audiobook.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated audiobook!');
    res.redirect(`/audiobooks/${audiobook._id}`);
};

module.exports.deleteAudiobook = async (req, res) => {
    const { id } = req.params;
    await Audiobook.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted audiobook');
    res.redirect('/audiobooks');
};
