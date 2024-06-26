const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    audiobooks: [
        {
            audiobookId: {
                type: Schema.Types.ObjectId,
                ref: 'Audiobook',
                required: true
            },
            addedAt: {
                type: Date,
                default: Date.now
            },
            position: {
                type: Number,
                required: true
            }
        }
    ]
});

module.exports = mongoose.model('Playlist', PlaylistSchema);

    