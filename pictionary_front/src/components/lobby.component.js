import React, { Component } from 'react';
import axios from 'axios';
import { contextUserData } from '../Context'

export default class Lobby extends Component {
    static contextType = contextUserData

    constructor(props){
        super(props);

        this.dashboard = this.dashboard.bind(this);
        this.newGame = this.newGame.bind(this);
        this.refresh = this.refresh.bind(this);
        
        this.state = {
            token: '',
            name: '',
            games: [],
        }
    }

    componentDidMount(e){
        const token = this.context.token;
        if(!token){
            this.context.setFlashMsg({type: "warning", msg: "Please log in to access this content"})
            this.props.history.push("/users/login")
        }
        this.setState({token: token})
        
        axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT +  '/lobby', {
            params: {
            token: token
            }})
        .then(res => {
            this.setState({
            games: res.data.games,
            });
        })
        .catch((error) => {
            console.log(error);
        })
    }



    gameList(e){
        return (
            this.state.games.map(game => {
            return (
                <div style={{paddingBottom: '10px'}}>
                <div className="card bg-light">
                    <div className="card-header ">
                        <h6>{game.players.length} player(s) are playing</h6>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className='col'>
                                <p className="card-text">
                                    {game.creator.name +' created this game on '+game.date.slice(0,10)}
                                </p>
                            </div>
                            <div className='col'>
                                {game.isEnded ? '' : 
                                <button 
                                type="button" 
                                className="btn btn-primary btn-block" 
                                onClick={() => this.onClickJoin(game._id)}>
                                    Join Game
                                </button>}
                            </div>
                        
                        </div>
                    </div>
                </div>
                </div>
            )
        }))
    }

    onClickJoin(gameID){
        axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/joingame', {
            params: {
            token: this.state.token,
            gameID: gameID,
            from: 'lobby'
            }})
        .then(res => {
            if (res.data.type === 'success'){
                this.context.setGameID(gameID);
                this.props.history.push("/ingame/")
            } else {
                this.setState({
                    games: res.data.games
                })
            }

        }
        )
        .catch((error) => {
            console.log(error);
        })
    }

    numberGame(e){
        var n = this.state.games.length
        var sentence = ''
        if (n===1|| n===0){
            sentence = n.toString() + ' game'
        } else {
            sentence = n.toString() + ' games'
        }
        return <h4 style={{paddingTop: '10px'}}>There are currently {sentence} available</h4>
    }

    newGame(e){
        axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/newgame', {
            params: {
              token: this.state.token
            }})
        .then(res => {
            this.context.setGameID(res.data.gameID);
            this.props.history.push("/ingame")
        }
        )
        .catch((error) => {
            console.log(error);
          })
    }


    dashboard(e){
        this.props.history.push("/dashboard")
    }

    refresh(e){
        axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/lobby', {
            params: {
            token: this.state.token
            }})
        .then(res => {
            this.setState({
            games: res.data.games,
            });
        })
        .catch((error) => {
            console.log(error);
        })
    }

    render() {

        return (
            <div className="container addtop text-center">
                <div className="card text-white bg-primary" >
                <div className="card-header text-center">
                    <h1>Pictionary Lobby</h1>
                </div>
                <div className="card-body">
                <div className="row">
                    <div className="col" style={{paddingRight: '3%', paddingLeft: '3%'}}>
                        <div className='row'>
                            <button type="button" className="btn btn-primary btn-block" disabled><h4>Pick a game</h4></button>
                            
                        </div>
                        <div className='row' style={{paddingTop: '1%'}}>
                            <button type="button" class="btn btn-success btn-block" onClick={this.refresh}>
                                <span class="glyphicon glyphicon-refresh">Refresh</span> 
                            </button>
                        </div>
                    </div>
                    <div className="col" style={{paddingRight: '3%', paddingLeft: '3%'}}>
                        <div className='row'>
                            <button type="button" className="btn btn-secondary btn-block" onClick={this.dashboard}>Dashboard</button>
                        </div>
                        <div className='row addtop'>
                            <button type="button" className="btn btn-info btn-block" onClick={this.newGame}>New Game</button>
                        </div>
                    </div>
                </div>
                </div>
                </div>
                
            <div>
                { this.numberGame() }
                { this.gameList() }
            </div>
            </div>
        )
    }
}
