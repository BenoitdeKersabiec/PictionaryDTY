import React, { Component } from 'react';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { contextUserData } from '../Context'


import './addtop.css'

export default class Dashboard extends Component {
    static contextType = contextUserData

    constructor(props){
        super(props);

        this.newParty = this.newParty.bind(this);
        this.partyCards = this.partyCards.bind(this);
        this.numberParty = this.numberParty.bind(this);
        this.Lobby = this.Lobby.bind(this);
        this.onClickLogout = this.onClickLogout.bind(this);

        this.state = {
            token: '',
            name: '',
            parties: [],
            curParty: [],
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

            axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/dash', {
                params: {
                token: token
                }})
            .then(res => 
                this.setState({
                name: res.data.name,
                parties: res.data.parties
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

    newParty(e){
        axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/newparty', {
            params: {
              token: this.state.token
            }})
        .then(res => {
            this.context.setGameID(res.data.partyID);
            localStorage.setItem('partyID', res.data.partyID);
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

    gamePlayers(party){
        if (party.isEnded){
            return (<div>
                    The game is over
                    <button type="button" className="close" aria-label="Close" onClick={() => this.onClickDelete(party._id)}>
                            <span aria-hidden="true">&times;</span>
                    </button>
                </div>)
        } else {
            return <h6>{party.players.length} player(s) are playing</h6>
        }
    }

    partyCards(e){

        return (
            this.state.parties.map(party => {
            return (
                <div className="card bg-light">
                    <div className="card-header ">
                        {this.gamePlayers(party)}
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className='col'>
                                <p className="card-text">
                                    {party.creator.name +' created this game on '+party.date.slice(0,10)}
                                </p>
                            </div>
                            <div className='col'>
                                {party.isEnded ? '' : 
                                <button 
                                type="button" 
                                className="btn btn-primary btn-block" 
                                onClick={() => this.onClickJoin(party._id)}>
                                    Join Game
                                </button>}
                            </div>
                        
                        </div>
                    </div>
                </div>
            )
        }))
    }
    
    onClickJoin(partyID){
        this.context.setGameID(partyID);
        localStorage.setItem('partyID', partyID);
        this.props.history.push("/ingame/")
    }

    onClickDelete(partyID){
        axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/delete', {
            params: {
              token: this.state.token,
              partyID: partyID
            }}).then(() => {
                axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/dash', {
                    params: {
                    token: this.state.token
                    }})
                .then(res => {
                    this.setState({
                        parties: res.data.parties
                    })
                }
                )
                .catch((error) => {
                    console.log(error);
                })
            })
    }

    numberParty(e){
        var n = this.state.parties.length
        
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
            return <h4>You have created {sentence} </h4>
        }
        
    }

    render(){
        
        return(
            <div className="container addtop">
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
                            <button type="button" className="btn btn-info btn-block" onClick={this.newParty}>New Game</button>
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

                <p>{ this.numberParty() }</p>
                <p>{ this.partyCards() }</p>
                
            </div>
        )
    }
}

