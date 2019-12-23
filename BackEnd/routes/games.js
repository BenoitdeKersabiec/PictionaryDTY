const express= require("express");
const router = express.Router();
var jwtUtils = require('../config/jwt.utils');
var mongoose = require('mongoose');

// Game model
const Game = require('../models/Game');


// return all the games created by someone. If admin, return all the games.
router.get('/dash', (req,res)=>{
    const token = req.query.token;
    if(jwtUtils.verifyToken(token) != null){
        var user = jwtUtils.getUserData(token);
        if (user.isAdmin){
            Game.find().then(games => {
                res.json({
                    name: user.name,
                    games: games
                })
            })
        } else {
            Game.find({creator: {id: mongoose.Types.ObjectId(user._id), name: user.name}}).then(games => {
                res.json({
                    name: user.name,
                    games: games
                })})
            
        }
    }
})

// Delete a game
router.get('/delete', (req,res) => {
    const token = req.query.token;
    
    if(jwtUtils.verifyToken(token) != null){
        var user = jwtUtils.getUserData(req.query.token);
        Game.findById(req.query.gameID).then(game => {
            if(game){
                if (game.creator.id.toString() === user._id || user.isAdmin){
                    res.json({msg: 'success'});
                    return game.remove();
                }
            } else {
                res.json({msg: 'success'});
            }
        })
    }
})

// create a new Game
router.get('/newgame', (req,res) => {
    const token = req.query.token;
    if(jwtUtils.verifyToken(token) != null){
        var user = jwtUtils.getUserData(req.query.token);
        const newGame = new Game({
            creator: {id: mongoose.Types.ObjectId(user._id),
                name: user.name},
            players: [],
        });
        newGame.save()
        .then(game => {
            res.json({msg: 'success', gameID: game._id});
        })
        .catch(err => {console.log(err);});
    }
});

// return all the ongoing games

router.get('/lobby', (req,res) => {
    const token = req.query.token;
    if(token){
        if(jwtUtils.verifyToken(token) != null){
            Game.find({isEnded: false}).then(games => {
                res.json({games: games});
            })
        }
    }
    
});

module.exports = router;