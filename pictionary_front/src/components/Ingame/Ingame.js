import React, { Component } from 'react';
import {CirclePicker} from 'react-color';
import socketIOClient from 'socket.io-client';
import Tool from './Tool';
import MessageBox from './MessageBox/MessageBox';
import Messages from './Messages/Messages';
import PlayerList from './PlayerList/PlayerList';
import Rodal from 'rodal';
import { contextUserData } from '../../Context';


import 'rodal/lib/rodal.css';

const ioAdress = process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SOCKET_PORT;
const canvasWidth = 450;
const canvasHeight = 450

export default class Ingame extends Component {
    static contextType = contextUserData

    constructor(props) {
        super(props);
        const messages = [];
        const players = [];

        this.choosenWord = this.choosenWord.bind(this)

        this.display = React.createRef();
        this.socket = null;
        this.state = {
            //game data
            time: 90,
            isDrawing: false,
            isPaused: false,
            hasStarted: false,
            isEnded: false,
            DrawerName: '',
            randWords: [{},{},{}],
            word: '',
            //For messaging
            messages,
            //For players
            players,
            //For Drawing
            brushColor : {r:0, g:0, b:0, a:255},
            brushSize : 3,
            toolId: 'pen',
            isPenDown: false,
            mouseX: 0,
            mouseY: 0,
            prevX: 0,
            prevY: 0,
            cursors: [],
            name: '',
            gameID: '',
            token: ''
        }
    }

    componentDidMount(){
        const token = this.context.token;
        const gameID = this.context.gameID
        if(!token){
            this.context.setFlashMsg({type: "warning", msg: "Please log in to access this content"})
            this.props.history.push("/users/login")
        }
        if(!gameID){
            this.props.history.push("/dashboard")
        }
        this.setState({token: token, gameID: gameID})

        // SocketIo communication init
        this.socket = socketIOClient(ioAdress);

        this.socket.on("playerList", (playerList)=> {
            this.setState({players: playerList})
        });

        this.socket.emit('new-user', {token: token, gameID: gameID})

        this.socket.on("newChatMessage", ({ message })=> {
            this.setState({messages: [message,...this.state.messages]})
        });

        this.socket.on("hasStarted", data => this.setState({hasStarted: data.hasStarted}))

        this.socket.on("gamePaused", data => {

            const displayCtx = this.display.current.getContext('2d');
            displayCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            this.setState({isPaused: data.isPaused});
            if (data.name){
                this.setState({DrawerName: data.name})
            }
            
        });

        this.socket.on("isEnded", data => {
            this.setState({isEnded: data.isEnded})
        })

        this.socket.on("setDrawwing", data=> {
            this.setState({isDrawing: data.isDrawing})
        });

        this.socket.on("timerCountdown", data => {
            this.setState({time: data.timer})
        });

        this.socket.on("chooseWord", data => {
            this.setState({randWords: data.words})
        });

        this.socket.on('line', data => {
            if (this.state.hasStarted){
                const [x1,y1,x2,y2] = data.lineCoordinates;

                const displayCtx = this.display.current.getContext('2d');

                displayCtx.lineWidth = data.lineWidth;
                displayCtx.lineCap = 'round';
                displayCtx.strokeStyle = `rgba(${data.lineColor.r},${data.lineColor.g},${data.lineColor.b},${data.lineColor.a})`;
                displayCtx.beginPath();
                displayCtx.moveTo(x1,y1);
                displayCtx.lineTo(x2,y2);
                displayCtx.stroke();
            }
        });

        this.socket.on('cursor', data => {
            if(this.state.loaded){
                this.setState({cursors: data});
            }
        });

        this.socket.on('setWord', data => this.setState({word: data.word}))
        setInterval(() => {
        }, Math.round(1000/60));
    }

    componentWillUnmount(){
        this.socket.disconnect()
    }

    sendMessage = ({message}) => {
       this.socket.emit("newChatMessage", {message, token:this.state.token,gameID: this.state.gameID})
    }
    
    handleNameInput(e){
        this.setState({name: e.target.value});
    }

    handleToolClick(toolId){
        this.setState({toolId})
    }

    handleColorChange(color){
        this.setState({brushColor: color.rgb});
    }

    handleUpdatePlayers(e){
        e.preventDefault()
        this.socket.emit('getPlayerList', {gameID: this.state.gameID})
    }

    

    handleDisplayMouseMove(e){
        this.setState({
            mouseX: e.clientX,
            mouseY: e.clientY
        });
        if(this.state.isPenDown && this.state.isDrawing){
            this.display.current.getContext('2d').lineCap = 'round';
            const {top, left} = this.display.current.getBoundingClientRect();
            switch(this.state.toolId){
                case 'pen':
                    this.socket.emit('line', {
                        lineWidth: this.state.brushSize,
                        lineColor: this.state.brushColor,
                        lineCoordinates: [this.state.prevX-left, this.state.prevY-top, this.state.mouseX - left, this.state.mouseY - top],
                        gameID: this.state.gameID
                    });
                    break;
                case 'eraser':
                    this.socket.emit('line', {
                        lineWidth: this.state.brushSize,
                        lineColor: {r: 255, g:255, b:255, a: this.state.brushColor.a},
                        lineCoordinates: [this.state.prevX-left, this.state.prevY-top, this.state.mouseX - left, this.state.mouseY - top],
                        gameID: this.state.gameID
                    });
                    break;
                default:
                    console.log('Choose pen or Eraser')
            }
        }
        this.setState({
            prevX: this.state.mouseX,
            prevY: this.state.mouseY
        });
        if(!this.state.isPenDown){
            this.setState({
                prevX: e.clientX,
                prevY: e.clientY
            })
        }
        this.socket.emit('cursor', {
            x: this.state.mouseX,
            y: this.state.mouseY,
            gameID: this.state.gameID
        });
    }

    handleDisplayMouseDown(e){
        this.setState({isPenDown: true});
    }

    handleDisplayMouseUp(e){
        this.setState({isPenDown: false});
    }

    handleBrushResize(e){
        this.setState({brushSize: e.target.value})
    }

    choosenWord(ind){
        const word = this.state.randWords[ind].word;
        this.socket.emit('wordChoosen', {word: word, gameID: this.state.gameID})
        this.setState({word: word})
    }

    handleStartGame(e){
        e.preventDefault()
        this.socket.emit('startGame', {gameID: this.state.gameID})
    }

    displayWinner(){
        const players = this.state.players;
        var maxScore = 0;
        var name = '';
        players.forEach(player => {
            if (player.score > maxScore){
                maxScore = player.score;
                name = player.name
            }
        });
        return <h4> {name} has won</h4>
    }

    displayWord(){
        if (this.state.isDrawing){
            return <h4>{this.state.word}</h4>
        } else {
            const word = this.state.word;
            var display = ''
            for (var i=0; i<word.length; i++){
                const letter = word.charAt(i)
                if (letter === ' '){
                    display = display + ' ';
                } else {
                    display = display + '_';
                }
            }
            return <h4>{display}</h4>
        }
    }

    displayStartButton(){
        if (this.state.players.length<2){
            return (
                <div>
                <button type="button" className="btn btn-success" disabled>
                            Start the Game
                </button>
                <small className="text-danger">You need to be at least 2 players</small>
                </div>
            )
        } else {
            return (
                <button type="button" className="btn btn-success" onClick={this.handleStartGame.bind(this)}>
                            Start the Game
                </button>
            )
        }
        
    }

    render() {
        const colorPicker = ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#ffffff", "#03a9f4", "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#888888", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722", "#795548", "#607d8b", "#000000"]

        return (
            <div style={{paddingTop: '10px'}}>            
            <div className="row">
            <div className="column" style={{width: '45%'}}>
                <div>
                
                    {this.state.hasStarted ?
                    <div>
                    <div className = "row">
                        <div className="column" style={{width: '50%'}}>
                            <button type="button" className="list-group-item active" style={{width: 'auto'}}disabled>
                                {this.state.time}
                            </button>
                        </div>
                        <div className="column" style={{width: '50%'}}>
                            {this.displayWord()}
                        </div>
                    </div>
                    

                    <canvas 
                    className='display' 
                    width={canvasWidth.toString()} 
                    height={canvasHeight.toString()}
                    ref={this.display}
                    style = {{border: "4px solid grey", backgroundColor: 'white'}}
                    onMouseMove={this.handleDisplayMouseMove.bind(this)}
                    onMouseDown={this.handleDisplayMouseDown.bind(this)}
                    onMouseUp={this.handleDisplayMouseUp.bind(this)}></canvas>
                    </div>: 
                    this.displayStartButton()}

                    {this.state.isDrawing ? 
                    <div className="toolbox" style={{paddingLeft:'30px'}}>
                        <div className='row'>
                            <div className='column'>
                                <CirclePicker 
                                colors={colorPicker}
                                width='294px'
                                color={this.state.brushColor} 
                                onChangeComplete={this.handleColorChange.bind(this)}/>
                            </div>
                            <div className='column' style={{paddingLeft:'50px'}}>
                                <div className='row' style={{paddingTop: '10px'}}>
                                    <Tool 
                                    name="Pen" 
                                    currentTool={this.state.toolId}
                                    toolId="pen" 
                                    onSelect={this.handleToolClick.bind(this)}/>
                                </div>
                                <div className='row' style={{paddingTop: '10px'}}>
                                    <Tool 
                                    name="Eraser" 
                                    currentTool={this.state.toolId}
                                    toolId="eraser" 
                                    onSelect={this.handleToolClick.bind(this)}/>
                                </div>
                            </div>
                        </div>
                        <div className='row' style={{paddingTop: '10px'}}>
                            <h8>Width</h8>
                            <input 

                            className='custom-range'
                            onChange={this.handleBrushResize.bind(this)}
                            value={this.state.brushSize}
                            type='range'
                            min='1'
                            max='50'
                            style={{width: '300px', paddingLeft: '15px'}}/>
                        </div>

                    </div> : ''}
                </div>
            </div>
            <div className="column" style={{width: '25%', paddingLeft: '0px'}}>
                <div className="row" id='messageContainer'>
                <Messages messages = {this.state.messages} />
                </div>
                {!this.state.isDrawing ? <div className="row">
                <MessageBox onSendMessage={ message => {
                    this.sendMessage({message});
                }}/>
                </div> :''}
            
            </div>
            <div className="column" style={{width: '25%', paddingLeft: '70px'}}>
                <PlayerList playerList={this.state.players} />
            </div>
            </div>
            
            <Rodal visible={this.state.isPaused} showCloseButton={false} customStyles={{backgroundColor:'#333'}} measure= 'px' height='100' width='500'>
                {this.state.isDrawing ?
                <div>
                    <h4>Choose a word</h4>
                    <div className = 'row'>
                    <div className="column" style={{width: '33%', paddingLeft: '10%', paddingRight: '5%'}}>
                        <button type="button" className="btn btn-primary btn-block" onClick={() =>
                            this.choosenWord(0)
                            }>
                            {this.state.randWords[0].word}
                        </button>
                    </div>
                    <div className="column" style={{width: '33%', paddingLeft: '5%', paddingRight: '5%'}}>
                        <button type="button" className="btn btn-primary btn-block" onClick={() =>
                            this.choosenWord(1)
                            }>
                            {this.state.randWords[1].word}
                        </button>
                    </div>
                    <div className="column" style={{width: '33%', paddingLeft: '5%', paddingRight: '10%'}}>
                        <button type="button" className="btn btn-primary btn-block" onClick={() =>
                            this.choosenWord(2)
                            }>
                            {this.state.randWords[2].word}
                        </button>
                    </div>
                    </div>
                </div>
                :<h4>{this.state.DrawerName} is choosing a word</h4>}
                </Rodal>
            <Rodal visible={this.state.isEnded} showCloseButton={false} measure='px' height={(200 + this.state.players.length*50).toString()} customStyles={{backgroundColor:'#333'}}>
                <p>{this.displayWinner()}</p>
                <PlayerList playerList={this.state.players} />
                <button type="button" className="btn btn-primary" onClick={() => {
                    this.socket.disconnect();
                    this.props.history.push('/dashboard')
                    }
                    
                    }>
                    Go back to Dashboad
                </button>
            </Rodal>
            </div>
        )
    }
}