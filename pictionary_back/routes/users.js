// eslint-disable-next-line
const express= require("express");
const router = express.Router();
// eslint-disable-next-line
const bcrypt = require('bcryptjs');
// eslint-disable-next-line
var jwtUtils = require('../config/jwt.utils');

// User model
// eslint-disable-next-line
const User = require('../models/User');

// Register Handler
router.route('/register').post((req,res) => {

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const errors = {
        msg: ''
    }
    // Check required fields

    if (!name || !email || !password || !password2) {
        errors.msg ='Please fill in all fields'
    }

    // Check Passwords match
    if (password !== password2){
        errors.msg ='Password do not match'
    }

    // Check Passwords length
    if (password.length < 6) {
        errors.msg = 'password should be at least 6 characters'
    }

    if (errors.msg.length>0){
        res.json(errors);
    } else {
        // Validation passed
        User.findOne({
            email: email
        }).then(user => {
            if(user){
                // User already exists
                errors.msg = 'Email is already registered'
                
                res.json(errors);
                
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });

                // Hash Password
                bcrypt.genSalt(10, (err, salt)=> 
                    bcrypt.hash(newUser.password, salt, (err, hash) =>{
                        if (err) throw err;
                        // Set password to hashed
                        newUser.password = hash;
                        //Save newUser
                        newUser.save()
                        .then(() => {
                            res.json({msg: 'success'});
                        })
                        .catch(err => console.log(err))
                }))
            }
        });
    }
});

// Login Handler
router.post('/login', (req,res)=>{
    User.findOne({email: req.body.email})
            .then(user => {
                if (!user){
                    
                    return res.json({msg: 'Email not registered'});
                }
                // Match password
                bcrypt.compare(req.body.password, user.password, (err, isMatch)=> {
                    if (err) throw err;
                    if (isMatch) {
                        res.json({msg: 'success',
                                token: jwtUtils.generateTokenForUser(user)});
                        
                    } else {
                        res.json({msg: 'Wrong password'})
                    }
                });
            })
            .catch(err => console.log(err))
    //res.json({msg: 'success'});
});

// eslint-disable-next-line
module.exports = router;