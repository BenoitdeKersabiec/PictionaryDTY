const express= require("express");
const router = express.Router();
const ensureAuthenticated = require('../config/auth').ensureAuthenticated;
var jwtUtils = require('../config/jwt.utils');
var mongoose = require('mongoose');

// User model
const User = require('../models/User');

// Party model
const Party = require('../models/Party');

router.get('/dash', (req,res)=>{
    const token = req.query.token;
    if(jwtUtils.verifyToken(token) != null){
        var user = jwtUtils.getUserData(token);
        if (user.isAdmin){
            Party.find().then(parties => {
                res.json({
                    name: user.name,
                    parties: parties
                })
            })
        } else {
            Party.find({creator: {id: mongoose.Types.ObjectId(user._id), name: user.name}}).then(parties => {
                res.json({
                    name: user.name,
                    parties: parties
                })})
            
        }
    }
})

router.get('/delete', (req,res) => {
    const token = req.query.token;
    
    if(jwtUtils.verifyToken(token) != null){
        var user = jwtUtils.getUserData(req.query.token);
        Party.findById(req.query.partyID).then(party => {
            if(party){
                if ((party.creator.id.toString() === user._id || user.isAdmin) && party){
                    res.json({msg: 'success'});
                    return party.remove();
                }
            } else {
                res.json({msg: 'success'});
            }
        })
    }
})

// New Party
router.get('/newparty', (req,res) => {
    const token = req.query.token;
    if(jwtUtils.verifyToken(token) != null){
        var user = jwtUtils.getUserData(req.query.token);
        const newParty = new Party({
            creator: {id: mongoose.Types.ObjectId(user._id),
                name: user.name},
            players: [],
        });
        newParty.save()
        .then(party => {
            res.json({msg: 'success', partyID: party._id});
        })
        .catch(err => {console.log(err);});
    }
});

// Join a Party

router.get('/lobby', (req,res) => {
    const token = req.query.token;
    if(token){
        if(jwtUtils.verifyToken(token) != null){
            Party.find({isEnded: false}).then(parties => {
                res.json({parties: parties});
            })
        }
    }
    
});


router.get('/ingame/', (req,res) => {
    const token = req.query.token;
    const partyId = req.query.partyId;
    if (token){
    if(jwtUtils.verifyToken(token) != null){
        var user = jwtUtils.getUserData(token)
        Party.find({isEnded: false, players: {$in : [mongoose.Types.ObjectId(user._id)]} }).then(curParty=> {
            //User already have party
            if (curParty.length>0 && (curParty[0]._id.toString() != partyId)){
                res.json({error: 'User is already in another party'})
            } else {
                new Promise((resolve, reject) => {
                    if(partyId){
                        Party.findById(partyId).then(resolve, reject);
                    } else {
                        throw 'ERROR'
                    }
                }).then(party => {
                    if(!party.players.includes(mongoose.Types.ObjectId(user._id))){
                    party.players.push(mongoose.Types.ObjectId(user._id));}
                    return party.save();
                }).then(() => {
                    res.json({msg: 'success'});
                }, err => {console.log(err)});
            }
        })
    }
    }
})

module.exports = router;