// eslint-disable-next-line
const mongoose = require('mongoose');

const WordSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true
    }
});

const Word = mongoose.model('Word', WordSchema);

// eslint-disable-next-line
module.exports = Word;