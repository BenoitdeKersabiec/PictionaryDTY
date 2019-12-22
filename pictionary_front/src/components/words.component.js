import React, { Component } from 'react'
import axios from 'axios';
import { contextUserData } from '../Context'
import jwt from 'jsonwebtoken';
import { withRouter } from "react-router-dom";

import './addtop.css'

export default withRouter(class Words extends Component {
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
                this.setState({token: token, isAdmin: data.isAdmin})
    
           
                axios.get('http://localhost:7000/word/words', {
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
        return(
            this.state.words.map(word => {
                return (
                    <li className="list-group-item">
                        {word.word}
                        <button type="button" class="close" aria-label="Close" onClick={() => this.onClickDelete(word._id)}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </li>
                )
            })
        )
        
    }

    onClickDelete(wordId){
        axios.get('http://localhost:7000/word/delete', {
            params: {
              token: this.state.token,
              wordId: wordId
            }}).then(res => {
                this.props.history.push('/words/')
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
            axios.post('http://localhost:7000/word/newword', newWord)
            .then(res => {
                if (res.data.msg === 'success'){
                    axios.get('http://localhost:7000/word/words', {
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
