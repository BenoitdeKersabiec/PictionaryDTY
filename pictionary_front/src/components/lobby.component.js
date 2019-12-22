import React, { Component } from 'react';
import axios from 'axios';
import { contextUserData } from '../Context'

export default class Lobby extends Component {
    static contextType = contextUserData

    constructor(props){
        super(props);

        this.dashboard = this.dashboard.bind(this);
        this.newParty = this.newParty.bind(this);
        this.refresh = this.refresh.bind(this);
        
        this.state = {
            token: '',
            name: '',
            parties: [],
        }
    }

    componentDidMount(e){
        const token = this.context.token;
        if(!token){
            this.context.setFlashMsg({type: "warning", msg: "Please log in to access this content"})
            this.props.history.push("/users/login")
        }
        this.setState({token: token})
        
        axios.get('http://localhost:7000/lobby', {
            params: {
            token: token
            }})
        .then(res => {
            this.setState({
            parties: res.data.parties,
            });
        })
        .catch((error) => {
            console.log(error);
        })
    }



    partyList(e){
        return (
            this.state.parties.map(party => {
            return (
                <div className="card bg-light">
                    <div className="card-header ">
                        <h6>{party.players.length} player(s) are playing</h6>
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
        console.log(partyID)
        this.context.setGameID(partyID);
        this.props.history.push("/ingame")
    }

    numberParty(e){
        var n = this.state.parties.length
        var sentence = ''
        if (n===1|| n===0){
            sentence = n.toString() + ' game'
        } else {
            sentence = n.toString() + ' games'
        }
        return <h4>There are currently {sentence} available</h4>
    }

    newParty(e){
        axios.get('http://localhost:7000/newparty', {
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


    dashboard(e){
        this.props.history.push("/dashboard")
    }

    refresh(e){
        
        axios.get('http://localhost:7000/lobby', {
            params: {
            token: this.state.token
            }})
        .then(res => {
            this.setState({
            parties: res.data.parties,
            });
        })
        .catch((error) => {
            console.log(error);
        })
    }

    render() {

        return (
            <div className="container addtop">
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
                            <button type="button" className="btn btn-info btn-block" onClick={this.newParty}>New Game</button>
                        </div>
                    </div>
                </div>
                </div>
                </div>
                
            <div>
                { this.numberParty() }
                { this.partyList() }
            </div>
            </div>
        )
    }
}
