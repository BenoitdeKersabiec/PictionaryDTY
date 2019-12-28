import React, { Component } from 'react'
import axios from 'axios';
import { contextUserData } from '../Context'
import jwt from 'jsonwebtoken';
import { withRouter } from "react-router-dom";

import './addtop.css'


// Word Manager for the admins
export default withRouter(class Words extends Component {
    // eslint-disable-next-line
    static contextType = contextUserData

    constructor(props){
        super(props);

        this.displayWords = this.displayWords.bind(this);
        this.onChangeWord = this.onChangeWord.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            token:'',
            words: [],
            newWord:''
        }
    }

    componentDidMount(e){
        const token = this.context.token;
        const data = jwt.decode(token);
        if(!data){
            this.context.setFlashMsg({type: "warning", msg: "Please log in to access this content"})
            this.props.history.push("/users/login")
        } else {
            if(!data.isAdmin){
                this.context.setFlashMsg({type: "warning", msg: "Only an admin account can access this content"})
                this.props.history.push('/users/login')
            } else {
                // only admin are here
                this.setState({token: token, isAdmin: data.isAdmin})

                axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/word/words', {
                    params: {
                    token: token
                    }})
                .then(res => this.setState({words: res.data})
                )
                .catch((error) => {
                    console.log(error);
                })
            }
    

        }

    }

    displayWords(e){
        const words = this.state.words;
        // we display the words in three columns
        const leftCol = [];
        const rightCol = [];
        const midCol = [];
        for (var i = 0; i< words.length; i++){
            const word = words[i]
            if (i%3 === 0){
                leftCol.push(word);
            }
            if (i%3 === 1){
                midCol.push(word);
            }
            if (i%3 === 2){
                rightCol.push(word);
            }

        }
        return(
            <div className='row'>
                <div className='column' style={{width:'33%', paddingLeft: '20px'}}>
                    {leftCol.map(word => {
                        return (
                            <li className="list-group-item" key={word._id}>
                                {word.word}
                                <button type="button" className="close" aria-label="Close" onClick={() => this.onClickDelete(word._id)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </li>
                        )
                    })}
                </div>
                <div className='column' style={{width:'33%', paddingLeft: '20px'}}>
                    {midCol.map(word => {
                        return (
                            <li className="list-group-item" key={word._id}>
                                {word.word}
                                <button type="button" className="close" aria-label="Close" onClick={() => this.onClickDelete(word._id)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </li>
                        )
                    })}
                </div>
                <div className='column' style={{width:'33%', paddingLeft: '20px'}}>
                    {rightCol.map(word => {
                        return (
                            <li className="list-group-item" key={word._id}>
                                {word.word}
                                <button type="button" className="close" aria-label="Close" onClick={() => this.onClickDelete(word._id)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </li>
                        )
                    })}
                </div>
            </div>
        )
        
    }

    onClickDelete(wordId){
        axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/word/delete', {
            params: {
              token: this.state.token,
              wordId: wordId
            }}).then(res => {
                axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/word/words', {
                    params: {
                    token: this.state.token
                    }})
                .then(res => this.setState({words: res.data})
                )
                .catch((error) => {
                    console.log(error);
                })
            })
    }

    onChangeWord(e){
        this.setState({
            newWord: e.target.value
        })
    }

    onSubmit(e){
        e.preventDefault();
        const newWord = {
            token:this.state.token,
            word: this.state.newWord
        }
        if (newWord.word !==''){
            axios.post(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT +  '/word/newword', newWord)
            .then(res => {
                if (res.data.msg === 'success'){
                    axios.get(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT +  '/word/words', {
                        params: {
                        token: this.state.token
                        }})
                    .then(res => this.setState({words: res.data})
                    )
                    .catch((error) => {
                        console.log(error);
                    })
                }
            });
        }
            
    }


    render() {
        return (
            <div className="addtop">                   
                    <div className="card text-white bg-primary" >
                    <div className="card-header text-center">
                        <h1>Word Manager</h1>
                    </div>
                    <div className="card-body">
                    
                    <div className="row">
                        <div className="col">
                            <button 
                            type="submit" 
                            className="btn btn-secondary btn-block" 
                            onClick={()=> this.props.history.push('/dashboard')}>
                                DashBoard
                            </button>
                        </div>
                        <div className="col">
                            <div className="input-group">
                                <input 
                                className="form-control"
                                value={this.state.newWord}
                                onChange={this.onChangeWord}
                                />
                                <button 
                                type="submit" 
                                className="btn btn-secondary" 
                                onClick={this.onSubmit}>
                                    Add a word
                                </button>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
                <div>
                    <ul>{ this.displayWords() }</ul>
                </div>
            </div>
        )
    }
})
