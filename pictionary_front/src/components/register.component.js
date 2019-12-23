import React, {Component} from "react";
import axios from "axios";
import { contextUserData } from '../Context'

// eslint-disable-next-line
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default class Register extends Component {
  // eslint-disable-next-line
  static contextType = contextUserData

  constructor(props) {
    super(props);

    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangePassword2 = this.onChangePassword2.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      name: "",
      email: "",
      password: "",
      password2: "",
      invalidForm : true,
    };
  }

  onChangeName(e) {
    this.setState({
      name: e.target.value,
    });
  }

  onChangeEmail(e) {
    this.setState({
      email: e.target.value,
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value,
    });
  }

  onChangePassword2(e) {
    this.setState({
      password2: e.target.value,
    });
  }

  onSubmit(e) {
    e.preventDefault();

    const newUser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2,
    };

    axios.post(process.env.REACT_APP_SERVER_ADDRESS + process.env.REACT_APP_SERVER_PORT +  "/users/register", newUser)
        .then((res) => {
          if (res.data.msg === "success") {
            this.context.setFlashMsg({type: 'success', msg: "You are registered, you can now log in"})
            this.props.history.push("/users/login");
          } else {
            this.context.setFlashMsg({type: 'warning', msg: res.data.msg})
            console.log(res.data.msg);
          }
        });

    this.setState({
      name: "",
      email: "",
      password: "",
      password2: "",
    });
  }

  displayAlert(){
    if(this.context.flashMsg.msg){
        return (
                <div className={(`alert alert-${this.context.flashMsg.type}`)} role="alert">
                {this.context.flashMsg.msg}
                </div>
            )
    } else {
        return <div></div>
    }
    
}

  render() {
    return (
      
        
      <div className="row mt-5">
        <div className="col-md-6 m-auto">
          <div className="card card-body">
            <h1 className="text-center mb-3">
              <i className="fas fa-user-plus"></i> Register
            </h1>
            {this.displayAlert()}
            <form onSubmit={this.onSubmit}>
              <div className="form-group">
                <label htmlFor="name">Username</label>
                <input type="text"
                  required
                  className="form-control"
                  value={this.state.name}
                  onChange={this.onChangeName}
                />
                {this.state.name?'':<small className="text-danger">Can't be empty</small>}
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email"
                  required
                  className="form-control"
                  value={this.state.email}
                  onChange={this.onChangeEmail}
                />
                {EMAIL_REGEX.test(this.state.email) ? '' : 
                <small className="text-danger">Email invalid</small>}
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password"
                  required
                  className="form-control"
                  value={this.state.password}
                  onChange={this.onChangePassword}
                />
                {(this.state.password.length>=6) ? '' : <small className="text-danger">Password should be at least 6 characters</small>}
                
              </div>
              <div className="form-group">
                <label htmlFor="password2">Confirm Password</label>
                <input type="password"
                  required
                  className="form-control"
                  value={this.state.password2}
                  onChange={this.onChangePassword2}
                />
                {(!this.state.password2) || (this.state.password2 === this.state.password) ? '': 
                <small className="text-danger">Passwords are not matching</small>}
              </div>
              {(this.state.password2 === this.state.password) 
              && (this.state.password.length>=6) 
              && (EMAIL_REGEX.test(this.state.email)) 
              && (this.state.name) ?
              <button 
              type="submit" 
              className="btn btn-primary btn-lg btn-block"
              >
                        Register
              </button> :
              <button 
              type="submit" 
              className="btn btn-primary btn-lg btn-block"
              disabled
              >
                        Register
              </button>}
            </form>
            <p className="lead mt-4">
              Have An Account? <a href="/users/login">Login</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}