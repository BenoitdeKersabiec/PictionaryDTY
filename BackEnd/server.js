const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require("express-session");
const flash = require("connect-flash");
var jwtUtils = require('./config/jwt.utils');
const bodyParser = require('body-parser');
require('dotenv').config();

const gameDuration = 90

// create the app
const app = express();
const port = process.env.PORT || 7000;


// Socket.io import
const server = require('http').Server(app)
const io = require('socket.io')(server)

// Passport config
require('./config/passport')(passport);


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//connection to MongoDB
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// BodyParser
app.use(express.urlencoded({extended: false}));

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

// Connect Flas
app.use(flash());

// Global vars
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// routes definition
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/word', require('./routes/word'));

//----------- Game Class def ---------------
class Game{
    constructor() {
        this._timer = gameDuration;
        this._players = [];
        this._history = [];
        this._isDrawing = {};
        this.isPaused = false;
        this.hasStarted = false;
        this.word = '';
        this.isEnded = false;
    }
    setDrawing(socketID){
        this._isDrawing = socketID
    }
    getDrawing(){
        return this._isDrawing
    }
    getPlayers(){
        return this._players
    }
    getWord(){
        return this.word
    }
    addPlayers(data){
        this._players.push(data)
    }
    getId() {
        return this._id;
    }
    resetTimer(n) {
         this._timer = n;
    }
    decrementTimer() {
        this._timer -= 1;
    }
    getTimer() {
        return this._timer;
    }
};



//---------SocketIO Management--------------
server.listen(7001)

const games = {};
const maxScore = 500;


// import models
const Party = require('./models/Party');
const User = require('./models/User');
const Word = require('./models/Word')

io.on('connection', socket => {
    console.log('connection established!')

    socket.on('new-user', (data) => {
        var partyID = data.partyID
        if (games[partyID]){
            console.log('test')
            io.to(socket.id).emit('hasStarted', {hasStarted: games[partyID].hasStarted})
            if (games[partyID].word.length >0){
                io.to(partyID).emit('setWord', {word: games[partyID].word})
            }
        }
        if(data.token){
            if(jwtUtils.verifyToken(data.token) != null){
                var user = jwtUtils.getUserData(data.token);
                
                //io.to(data.partyID).emit("newChatMessage", { message: `${user.name} has joined`});
                if (!Object.keys(games).includes(partyID)){
                    games[partyID] = new Game();
                }
                games[partyID].addPlayers({name: user.name, socketID: socket.id, score:0, guessed: false, _id:user._id})
                socket.join(partyID)
                Party.findById(partyID, (err, game) => {
                    game.players = [...game.players, {id: user._id, name: user.name}];
                    game.save()
                }).then(() => {
                    io.to(partyID).emit('playerList', games[partyID]._players)
                    console.log("player added")
                    io.to(partyID).emit("newChatMessage", { message: `${user.name} has joined`});
                    if (games[partyID]){
                        for (i=0; i<games[partyID]._history.length; i++){
                            io.to(socket.id).emit('line', { 
                                lineWidth: games[partyID]._history[i].lineWidth,
                                lineColor: games[partyID]._history[i].lineColor,
                                lineCoordinates: games[partyID]._history[i].lineCoordinates,
                            });
                        }
                    }
                })


                
                
            }
        }
    })

    


    socket.on("newChatMessage", data =>{
        const token = data.token;
        const partyID = data.partyID;
        if (games[partyID]){
            const word = games[partyID].getWord();
            if(jwtUtils.verifyToken(token) != null){
                var user = jwtUtils.getUserData(token);
                if(data.message == word){
                    io.to(partyID).emit("newChatMessage", { message: `${user.name} guessed the word `});
                    var players=games[partyID]._players;
                    var indPlayer = 0;
                    var indDrawer = 0;
                    const socketDrawer = games[partyID].getDrawing().socketID;
                    for (i=0; i<players.length; i++){
                        if (players[i].socketID == socket.id){
                            indPlayer = i;
                        }
                        if (players[i].socketID == socketDrawer){
                            indDrawer = i;
                        }
                    }
                    if (!players[indPlayer].guessed){
                        players[indPlayer].score = players[indPlayer].score + games[partyID].getTimer();
                        players[indPlayer].guessed = true;
                        players[indDrawer].score = players[indDrawer].score + Math.floor(games[partyID].getTimer()/games[partyID].getPlayers().length)
                        io.to(partyID).emit('playerList', games[partyID]._players);  
                    }
                } else {
                    io.to(partyID).emit("newChatMessage", { message: `${user.name} : `+data.message});
                }
            }
        }

        
    });

    socket.on('startGame', data => {
        const gameID = data.gameID
        const game = games[gameID];
        game.hasStarted = true;
        io.to(gameID).emit('hasStarted', {hasStarted: true})
        const players=game.getPlayers();

        var newDrawer = players[0];
        game.setDrawing(newDrawer)
        io.to(newDrawer.socketID).emit('setDrawwing', {isDrawing: true})
        game.isPaused = true;
        // Choose three random word in the database and propose them to the drawer
        io.to(gameID).emit('gamePaused', {isPaused: true, name: newDrawer.name})
        Word.find().then(words => {
            var randWords = [];
            do {
                randWords.push(words.splice(
                                            Math.floor(Math.random() * words.length)
                                        , 1)[0]);
            } while (randWords.length < 3);
            io.to(newDrawer.socketID).emit('chooseWord', {words: randWords})
        })
    })

    socket.on('disconnect', () => {
        Object.keys(games).forEach(partyID =>{
            var game = games[partyID];
            for(i=0; i<game._players.length; i++){
                const player= game._players[i]
                if (player.socketID === socket.id){
                    games[partyID]._players.splice(i,1);
                    Party.findById(partyID, (err, gamedb) => {
                        if (gamedb){
                            const players = gamedb.players;
                            var ind = 0
                            while (!players[ind].id ===player._id && ind<100){
                                ind ++
                            }
                            if(ind === 100){
                                console.log('soucis dans la matrice')
                            } else {
                                gamedb.players.splice(ind,1);
                            }
                            gamedb.save();
                        }
                        
                    }).then(() => {
                        io.to(partyID).emit("newChatMessage", { message: `${player.name} has left`});
                        io.to(partyID).emit('playerList', games[partyID]._players);
                        console.log("disconnected succesfully")
                    })
                    
                }
            }
        })
    })

    socket.on('line', data => {
        const lineCoordinates = data.lineCoordinates;
        var partyID = data.partyID;
        games[partyID]._history.push({lineWidth: data.lineWidth, lineColor: data.lineColor, lineCoordinates: data.lineCoordinates})
        io.to(data.partyID).emit('line', { 
            lineWidth: data.lineWidth,
            lineColor: data.lineColor,
            lineCoordinates
        });
    });

    socket.on('wordChoosen', data =>{
        const partyID = data.partyID;
        const word = data.word;
        const game = games[partyID]
        game.word = word;
        game.isPaused = false;
        io.to(partyID).emit('gamePaused', {isPaused: false})
        game.resetTimer(gameDuration);
        game._history= [];
        game._players.forEach(function(player){
            player.guessed = false;
        })
        io.to(partyID).emit('setWord', {word: word})
        
    })
});

function timeWatcher() {
    const gameIds = Object.keys(games);
    for (i=0; i<gameIds.length; i++){
        const partyID = gameIds[i];
        const game = games[partyID];
        if (!game.isPaused && game.hasStarted){
            game.decrementTimer();
            const timer = game.getTimer()
            NbGuessed= 0;
            players=game.getPlayers();
            players.forEach(function(player) {
                if (player.guessed){
                    NbGuessed = NbGuessed + 1
                }
            })
            if(timer <= 0 || (NbGuessed >= players.length - 1 && players.length > 1) || players.length === 0){
                const players=game.getPlayers();
                const drawer = game.getDrawing();

                isEnded=false;

                players.forEach(player => {
                    if (player.score > maxScore) {
                        isEnded = true
                    }
                })
                if (players.length===0){
                    isEnded = true
                }

                if (isEnded){
                    console.log('Party Ended')
                    Party.findById(partyID, (err, doc) => {
                        doc.isEnded = true;
                        doc.save()
                    }).then(() => io.to(partyID).emit('isEnded', {isEnded}))
                    delete games[partyID]
                    
                    
                    

                } else {
                    var indDrawer = 0;
                    for(i=0; i<players.length; i++){
                        const player= players[i];
                        if (player === drawer){
                            indDrawer = i;
                        }
                    }
                    io.to(drawer.socketID).emit('setDrawwing', {isDrawing: false})
                    var indNewDrawer = 0;
                    if (indDrawer == players.length - 1){
                        indNewDrawer = 0;
                    } else {
                        indNewDrawer = indDrawer + 1
                    }
                    var newDrawer = players[indNewDrawer];
                    game.setDrawing(newDrawer)
                    io.to(newDrawer.socketID).emit('setDrawwing', {isDrawing: true})
                    game.isPaused = true;
                    // Choose three random word in the database and propose them to the drawer
                    io.to(partyID).emit('gamePaused', {isPaused: true, name: newDrawer.name})
                    Word.find().then(words => {
                        var randWords = [];
                        do {
                            randWords.push(words.splice(
                                                        Math.floor(Math.random() * words.length)
                                                    , 1)[0]);
                        } while (randWords.length < 3);
                        io.to(newDrawer.socketID).emit('chooseWord', {words: randWords})
                    })
                }
                

            }
            io.to(partyID).emit('timerCountdown', {timer})
        }
    }
}
setInterval(timeWatcher, 1000)

app.listen(port, () => {
    console.log(`server is running on port: ${port}`);
})