const express= require("express");
const router = express.Router();
var jwtUtils = require('../config/jwt.utils');

// Word model
const Word = require('../models/Word');

// Create new word
router.post('/newword', (req,res) => {
    const token = req.body.token;
    if(jwtUtils.verifyToken(token) != null){
        var user = jwtUtils.getUserData(token);
        if (user.isAdmin){
            const newWord = new Word({
                word: req.body.word.toLowerCase()
            });
            newWord.save()
            .then(() => {
                res.json({msg: 'success'});
            })
            .catch(err => {console.log(err);});
        }
    }
})

// Get all the existing words
router.get('/words', (req,res) => {
    const token = req.query.token;
    if(jwtUtils.verifyToken(token) != null){
        var user = jwtUtils.getUserData(token);
        if (user.isAdmin){
            Word.find().then(words => res.json(words))
        }
    }
})

// Delete a word
router.get('/delete', (req,res) => {
    const token = req.query.token;
    if(jwtUtils.verifyToken(token) != null){
        var user = jwtUtils.getUserData(token);
        if (user.isAdmin){
            Word.findById(req.query.wordId).then(word => {
                if (word){
                    res.json({msg: 'success'});
                    return word.remove()
                }
            })
        }
    }
})

module.exports = router;