const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
    creator: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: {
            type: String
        }
    },
    date: {
        type: Date,
        default: Date.now
    },
    players: [{ id:
        {
            type: String,
        }, name :
        {
            type: String
        },
        _id: false
        }
    ],
    isEnded: {
        type: Boolean,
        default: false
    }
});

function memberLimit(val){
    return val.length <=10
};

const Party = mongoose.model('Party', PartySchema);

module.exports = Party;