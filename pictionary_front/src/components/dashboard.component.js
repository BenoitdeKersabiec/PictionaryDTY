import React, { Component } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { contextUserData } from '../Context'


import './addtop.css'

export default class Dashboard extends Component {
    static contextType = contextUserData

    constructor(props){
        super(props);

        this.newGame = this.newGame.bind(this);
        this.gameCards = this.gameCards.bind(this);
        this.numberGame = this.numberGame.bind(this);
        this.Lobby = this.Lobby.bind(this);
        this.onClickLogout = this.onClickLogout.bind(this);
        this.onClickJoin = this.onClickJoin.bind(this);

        this.state = {
            token: '',
            name: '',
            games: [],
            isAdmin: false
        }
    }

    componentDidMount(){
        const token = this.context.token;
        const data = jwt.decode(token);
        if(!data){
            this.context.setFlashMsg({type: "warning", msg: "Please log in to access this content"})
            this.props.history.push("/users/login")
        } else {

            this.setState({token: token, isAdmin: data.isAdmin})

            axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/dashboard', {
                params: {
                token: token
                }})
            .then(res => 
                this.setState({
                name: res.data.name,
                games: res.data.games
            }))
            .catch((error) => {
                console.log(error);
            })
        }
    }

    onClickLogout(e){
        this.context.setToken("");
        this.props.history.push("/")
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

    Lobby(e){
        this.props.history.push("/lobby")
    }

    gamePlayers(game){
        if (game.isEnded){
            return (<div>
                    The game is over
                    <button type="button" className="close" aria-label="Close" onClick={() => this.onClickDelete(game._id)}>
                            <span aria-hidden="true">&times;</span>
                    </button>
                </div>)
        } else {
            return <h6>{game.players.length} player(s) are playing</h6>
        }
    }

    gameCards(e){

        return (
            this.state.games.map(game => {
            return (
                <div style={{paddingBottom: '10px'}}>
                <div className="card bg-light">
                    <div className="card-header ">
                        {this.gamePlayers(game)}
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
            from: 'dashboard'
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

    onClickDelete(gameID){
        axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/delete', {
            params: {
              token: this.state.token,
              gameID: gameID
            }}).then(() => {
                axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/dashboard', {
                    params: {
                    token: this.state.token
                    }})
                .then(res => {
                    this.setState({
                        games: res.data.games
                    })
                }
                )
                .catch((error) => {
                    console.log(error);
                })
            })
    }

    numberGame(e){
        var n = this.state.games.length
        
        var sentence = ''
        
        if (this.state.isAdmin){
            if (n===1|| n===0){
                sentence = 'is '+ n.toString() + ' game'
            } else {
                sentence = 'are '+ n.toString() + ' games'
            }
            return <h4> There {sentence} in the database </h4>
        } else {
            if (n===1|| n===0){
                sentence = n.toString() + ' game'
            } else {
                sentence = n.toString() + ' games'
            }
            return <h4 style={{paddingTop: '10px'}}>You have created {sentence} </h4>
        }
        
    }

    render(){
        
        return(
            <div className="container addtop text-center">
                <div className="card text-white bg-primary" >
                <div className="card-header text-center">
                    <h1>Dashboard</h1>
                </div>
                <div className="card-body">
                <div className="row">
                    <div className="col text-center">
                        <div className='row'>
                            <button type="button" className="btn btn-primary btn-block" disabled><h4>Welcome {this.state.name}</h4></button>
                        </div>
                        <div className="row" style={{paddingTop: '1%'}}>
                            <button type="button" className="btn btn-secondary btn-block" onClick={this.onClickLogout}>Logout</button>
                        </div>
                    </div>
                    <div className="col">
                    <div className="row">
                        <div className="col">
                            <button type="button" className="btn btn-info btn-block" onClick={this.newGame}>New Game</button>
                        </div>
                        {!this.state.isAdmin ? '' :
                        <div className="col">
                            <button 
                            type="button" 
                            className="btn btn-secondary btn-block" 
                            onClick={() => this.props.history.push("/words")}>
                                Manage Words
                            </button>
                        </div>}
                    </div>
                    <div className="row addtop">
                        <div className="col">
                            <button type="button" className="btn btn-success btn-block" onClick={this.Lobby}>Join a Game</button>
                        </div>
                        
                    </div>
                    
                        
                    </div>
                </div>
                </div>
                </div>

                <p>{ this.numberGame() }</p>
                <p>{ this.gameCards() }</p>
                
            </div>
        )
    }
}

