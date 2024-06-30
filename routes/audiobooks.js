const express = require('express');
const router = express.Router();
const audiobooks = require('../controllers/audiobooks');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateAudiobook, emailVerified } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Audiobook = require('../models/audiobook');

router.route('/')
    .get(catchAsync(audiobooks.index))
    .post(isLoggedIn, upload.array('image'), validateAudiobook, catchAsync(audiobooks.createAudiobook))


router.get('/new', isLoggedIn, emailVerified, audiobooks.renderNewForm)

router.route('/:id')
    .get(catchAsync(audiobooks.showAudiobook))
    .put(isLoggedIn, emailVerified, isAuthor, upload.array('image'), validateAudiobook, catchAsync(audiobooks.updateAudiobook))
    .delete(isLoggedIn, emailVerified, isAuthor, catchAsync(audiobooks.deleteAudiobook));

router.get('/:id/edit', isLoggedIn, emailVerified, isAuthor, catchAsync(audiobooks.renderEditForm))

// router.get('/', catchAsync(audiobooks.filterAndSortAudiobooks));
// router.post('/filter', catchAsync(audiobooks.filterAndSortAudiobooks));

module.exports = router;