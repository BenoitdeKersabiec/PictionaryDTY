// eslint-disable-next-line
const express= require("express");
const router = express.Router();
// eslint-disable-next-line
var jwtUtils = require('../config/jwt.utils');
// eslint-disable-next-line
var mongoose = require('mongoose');

// Game model
// eslint-disable-next-line
const Game = require('../models/Game');


// return all the games created by someone. If admin, return all the games.
router.get('/dashboard', (req,res)=>{
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

// when a user want to join a game 
router.get('/joingame', (req,res) => {

    const token = req.query.token;
    const gameID = req.query.gameID;
    if(token){
        if(jwtUtils.verifyToken(token) != null){
            var user = jwtUtils.getUserData(req.query.token)
            Game.findById(gameID).then(game => {
                var failure =false;
                var msg = ''
                if (game){
                    // Check if the player isn't already in the room
                    const players = game.players;
                    players.forEach(player => {
                        if (player.id === user._id){
                            failure = true;
                            msg = 'User already in this game'
                        }
                    })
                    // Check if the room is steal available
                    if (game.isEnded){
                        failure = true;
                        msg= 'The room is closed, the rooms you are now seeing have been refreshed'
                    } 
                } else {
                    failure = true;
                    msg= "The room doesn't exist anymore, the rooms you are now seeing have been refreshed"
                }
                // we send an update of the games according to where the req come from
                if (failure){
                    if (req.query.from === 'dashboard'){
                        if (user.isAdmin){
                            Game.find().then(games => {
                                res.json({
                                    type: 'failure',
                                    games: games,
                                    msg: msg
                                })
                            })
                        } else {
                            Game.find({creator: {id: mongoose.Types.ObjectId(user._id), name: user.name}})
                            .then(games => {
                                res.json({
                                    type: 'failure',
                                    games: games,
                                    msg: msg
                                })})
                        }
                    }
                    if (req.query.from === 'lobby'){
                        Game.find({isEnded: false}).then(games => {
                            res.json({
                                type: 'failure',
                                games: games,
                                msg: msg
                            });
                        })
                    }
                } else {
                    //the game is available
                    res.json({type: 'success', parties: [], msg:''})
                }
            })
        }
    }

    
})
// eslint-disable-next-line
module.exports = router;