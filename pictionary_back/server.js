const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require("express-session");
var jwtUtils = require('./config/jwt.utils');
require('dotenv').config();

const gameDuration = 90

// create the app
const app = express();
const port = process.env.PORT || 7000;


// Socket.io import
const server = require('http').Server(app)
const io = require('socket.io')(server)


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//connection to MongoDB
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

// routes definition
app.use('/', require('./routes/games'));
app.use('/users', require('./routes/users'));
app.use('/word', require('./routes/word'));

//----------- Game Class def ---------------
class GameCache{
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

// consts
const games = {};
const maxScore = 500;


// import models
const Game = require('./models/Game');
const Word = require('./models/Word')

io.on('connection', socket => {
    console.log('connection established!')

    // A user join a game
    socket.on('new-user', (data) => {
        var gameID = data.gameID

        if(data.token){
            if(jwtUtils.verifyToken(data.token) != null){
                // get user data from token
                var user = jwtUtils.getUserData(data.token);
                
                if (!Object.keys(games).includes(gameID)){
                    // new game
                    games[gameID] = new GameCache();
                } else {
                    // inform user from game data
                    io.to(socket.id).emit('hasStarted', {hasStarted: games[gameID].hasStarted})
                    if (games[gameID].word.length >0){
                        io.to(socket.id).emit('setWord', {word: games[gameID].word})
                    }
                    for (i=0; i<games[gameID]._history.length; i++){
                        io.to(socket.id).emit('line', { 
                            lineWidth: games[gameID]._history[i].lineWidth,
                            lineColor: games[gameID]._history[i].lineColor,
                            lineCoordinates: games[gameID]._history[i].lineCoordinates,
                        });
                    }
                }
                // add player in DerverCache/SocketRooms/DataBase
                games[gameID].addPlayers({name: user.name, socketID: socket.id, score:0, guessed: false, _id:user._id})
                socket.join(gameID)
                Game.findById(gameID, (err, game) => {
                    game.players = [...game.players, {id: user._id, name: user.name}];
                    game.save()
                }).then(() => {
                    console.log("player added")
                    // Give the upate to the game player of the new user
                    io.to(gameID).emit('playerList', games[gameID]._players)
                    io.to(gameID).emit("newChatMessage", { message: `${user.name} has joined`}); 
                })
            }
        }
    })

    //Chat Manager
    socket.on("newChatMessage", data =>{
        const token = data.token;
        const gameID = data.gameID;
        if (games[gameID]){
            const word = games[gameID].getWord();
            if(jwtUtils.verifyToken(token) != null){
                var user = jwtUtils.getUserData(token);
                
                if(data.message.toLowerCase() == word){
                    // if the player guessed the word
                    // inform the players that user guessed the word
                    io.to(gameID).emit("newChatMessage", { message: `${user.name} guessed the word `});

                    //update the score of the drawer and the user
                    var players=games[gameID]._players;
                    var indPlayer = 0;
                    var indDrawer = 0;
                    const socketDrawer = games[gameID].getDrawing().socketID;
                    for (i=0; i<players.length; i++){
                        if (players[i].socketID == socket.id){
                            indPlayer = i;
                        }
                        if (players[i].socketID == socketDrawer){
                            indDrawer = i;
                        }
                    }
                    if (!players[indPlayer].guessed){
                        players[indPlayer].score = players[indPlayer].score + games[gameID].getTimer();
                        players[indPlayer].guessed = true;
                        players[indDrawer].score = players[indDrawer].score + Math.floor(games[gameID].getTimer()/games[gameID].getPlayers().length)
                        // inform the players of the new score
                        io.to(gameID).emit('playerList', games[gameID]._players);  
                    }
                } else {
                    //normal message
                    io.to(gameID).emit("newChatMessage", { message: `${user.name} : `+data.message});
                }
            }
        }

        
    });

    // Begin a game (eg start drawing and everything)
    socket.on('startGame', data => {
        const gameID = data.gameID
        const game = games[gameID];
        game.hasStarted = true;
        // inform the players
        io.to(gameID).emit('hasStarted', {hasStarted: true})
        // pick a drawer
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

    // Manage players disconnection
    socket.on('disconnect', () => {
        // because we can only access the socketID, we have to check all the cache to find the game
        Object.keys(games).forEach(gameID =>{
            var game = games[gameID];
            for(i=0; i<game._players.length; i++){
                const player= game._players[i]
                if (player.socketID === socket.id){
                    // We find the player
                    games[gameID]._players.splice(i,1);
                    Game.findById(gameID, (err, gamedb) => {
                        if (gamedb){
                            // we delete the player from the game in the database
                            const players = gamedb.players;
                            var ind = 0
                            while (!players[ind].id ===player._id){
                                ind ++
                            }
                            
                            gamedb.players.splice(ind,1);
                            
                            gamedb.save();
                        }
                        
                    }).then(() => {
                        if(games[gameID]){
                            // we inform the other players
                            io.to(gameID).emit("newChatMessage", { message: `${player.name} has left`});
                            io.to(gameID).emit('playerList', games[gameID]._players);
                            console.log("disconnected succesfully")
                        }
                    })
                    
                }
            }
        })
    })

    // manage line drawing
    socket.on('line', data => {
        const lineCoordinates = data.lineCoordinates;
        var gameID = data.gameID;
        games[gameID]._history.push({lineWidth: data.lineWidth, lineColor: data.lineColor, lineCoordinates: data.lineCoordinates})
        io.to(data.gameID).emit('line', { 
            lineWidth: data.lineWidth,
            lineColor: data.lineColor,
            lineCoordinates
        });
    });

    // the drawer has choosen a word
    socket.on('wordChoosen', data =>{
        const gameID = data.gameID;
        const word = data.word;
        const game = games[gameID]
        game.word = word;
        // start a new round
        game.isPaused = false;
        io.to(gameID).emit('gamePaused', {isPaused: false})
        game.resetTimer(gameDuration);
        game._history= [];
        game._players.forEach(function(player){
            player.guessed = false;
        })
        io.to(gameID).emit('setWord', {word: word})
        
    })
});

// Manage a round
function timeWatcher() {
    const gameIds = Object.keys(games);
    for (i=0; i<gameIds.length; i++){
        // for each party
        const gameID = gameIds[i];
        const game = games[gameID];
        var isEnded=false;
        const players=game.getPlayers();

        if (players.length===0){
            isEnded = true
        }
        if (!game.isPaused && game.hasStarted && !isEnded){
            // if there is a round ongoing
            game.decrementTimer();
            const timer = game.getTimer()

            var NbGuessed= 0;
            
            players.forEach(function(player) {
                if (player.guessed){
                    NbGuessed = NbGuessed + 1
                }
            })

            players.forEach(player => {
                if (player.score > maxScore) {
                    isEnded = true
                }
            })

            if(timer <= 0 || (NbGuessed >= players.length - 1 && players.length > 1) && !isEnded){
                // if time has ellapsed or everybody has guessed we start a new round
                const drawer = game.getDrawing();
                
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
            }
            io.to(gameID).emit('timerCountdown', {timer})
        }
        if (isEnded){
            // we delete the game from the cache and end it in the database
            console.log('Game Ended')
            Game.findById(gameID, (err, doc) => {
                doc.isEnded = true;
                doc.save()
            }).then(() => io.to(gameID).emit('isEnded', {isEnded})) //inform the players
            delete games[gameID]
            
        }
    }
}
setInterval(timeWatcher, 1000)

app.listen(port, () => {
    console.log(`server is running on port: ${port}`);
})