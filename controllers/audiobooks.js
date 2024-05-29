const Audiobook = require('../models/audiobook');

const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    console.log(req.query);
    let audiobooks = await Audiobook.find({}).populate('reviews').populate('popupText');
    const { genre, title, sort } = req.query;
        // Filter audiobooks based on query parameters
        if (genre || title) {
            const filterOptions = {};
    
            if (genre) {
                filterOptions.genre = { $in: genre };
            }
    
            if (title) {
                filterOptions.title = { $regex: title, $options: 'i' };
            }
    
            // if (author) {
            //     filterOptions.author = { $in: author };
            // }
    
            audiobooks = await Audiobook.find(filterOptions).populate('reviews');
        }
    

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
    res.render('audiobooks/index', { audiobooks })
}

module.exports.renderNewForm = (req, res) => {
    res.render('audiobooks/new');
}

module.exports.createAudiobook = async (req, res, next) => {

    const audiobook = new Audiobook(req.body.audiobook);

    audiobook.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    audiobook.author = req.user._id;
    await audiobook.save();
    console.log(audiobook);
    req.flash('success', 'Successfully made a new audiobook!');
    res.redirect(`/audiobooks/${audiobook._id}`)
}

module.exports.showAudiobook = async (req, res,) => {
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
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const audiobook = await Audiobook.findById(id)
    if (!audiobook) {
        req.flash('error', 'Cannot find that audiobook!');
        return res.redirect('/audiobooks');
    }
    res.render('audiobooks/edit', { audiobook });
}

module.exports.updateAudiobook = async (req, res) => {
    const { id } = req.params;
    //console.log(req.body);
    const audiobook = await Audiobook.findByIdAndUpdate(id, { ...req.body.audiobook });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    audiobook.images.push(...imgs);
    await audiobook.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await audiobook.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated audiobook!');
    res.redirect(`/audiobooks/${audiobook._id}`)
}

module.exports.deleteAudiobook = async (req, res) => {
    const { id } = req.params;
    await Audiobook.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted audiobook')
    res.redirect('/audiobooks');
}

// Import necessary modules and models


// Define the controller function
module.exports.filterAndSortAudiobooks = async (req, res) => {
    try {
        // Initialize filter and sort objects
        let filter = {};
        let sort = {};

        // Log the request parameters for debugging
        console.log("req", req);

        // Apply filters based on query parameters
        if (req.query.genre) {
            filter.genre = req.query.genre;
        }
        if (req.query.title) {
            filter.title = new RegExp(req.query.title, 'i'); // Case-insensitive search
        }

        // Apply sorting based on query parameters
        if (req.query.sort === 'rating') {
            sort.rating = -1; // Sort by rating in descending order
        }

        // Retrieve filtered and sorted audiobooks from the database
        const audiobooks = await Audiobook.find(filter).sort(sort).populate('popupText');

        // Render the audiobooks index page with the retrieved data
        res.render('audiobooks/index', { audiobooks });
    } catch (error) {
        // Handle any errors that occur during execution
        console.error('Error in filterAndSortAudiobooks:', error);
        // Render an error page or redirect to a different route as needed
        res.status(500).send('Internal Server Error');
    }
};
