import React, { Component } from 'react';
import axios from 'axios';
import { contextUserData } from '../Context'

export default class Login extends Component {
    static contextType = contextUserData
    constructor(props){
        super(props);
        
        let loggedIn = false;

        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            email: '',
            password: '',
            loggedIn
        }
    }

    onChangeEmail(e){
        this.setState({
            email: e.target.value
        })
    }

    onChangePassword(e){
        this.setState({
            password: e.target.value
        })
    }

    onSubmit(e){
        e.preventDefault();

        const user = {
            email: this.state.email,
            password: this.state.password
        };

        axios.post(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT + '/users/login', user)
        .then(res => {
            if (res.data.msg === 'success'){
                this.context.setToken(res.data.token)
                this.context.setFlashMsg({type:"", msg:""})
                this.props.history.push("/dashboard")
            } else {
                this.context.setFlashMsg({type: "warning", msg: res.data.msg})
            }
        });


    }

    displayAlert(){
        return (
        <div class={(`alert alert-${this.context.flashMsg.type}`)} role="alert">
          {this.context.flashMsg.msg}
        </div>)
      }

    render(){
        return(
            <div className="row mt-5">
                <div className="col-md-6 m-auto">
                    <div className="card card-body">
                    <h1 className="text-center mb-3"><i className="fas fa-sign-in-alt"></i>  Login</h1>
                    {this.displayAlert()}
                    <form onSubmit={this.onSubmit}>
                        <div className="form-group">
                        <label for="email">Email</label>
                        <input  type="email"
                            required
                            className="form-control"
                            value={this.state.email}
                            onChange={this.onChangeEmail}
                            />
                        </div>
                        <div className="form-group">
                        <label for="password">Password</label>
                        <input  type="password"
                            required
                            className="form-control"
                            value={this.state.password}
                            onChange={this.onChangePassword}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">Login</button>
                    </form>
                    <p className="lead mt-4">
                        No Account? <a href="/users/register">Register</a>
                    </p>
                    </div>
                </div>
            </div>
        )
    }
}