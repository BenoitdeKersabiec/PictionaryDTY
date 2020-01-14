// eslint-disable-next-line
import React, {Component} from "react";
import logo from './logoWelcome.png'

export default class CreateUser extends Component {
  render() {
    return (
      <div className="row mt-5">
        <div className="col-md-6 m-auto">
          <div className="card card-body text-center">
            <h1>Pictionary</h1>
            <hr></hr>
            <p>Create an account or login</p>
            <a href="/users/register" className="btn btn-primary btn-block mb-2"
            >Register</a
            >
            <a href="/users/login" className="btn btn-secondary btn-block">
              Login
            </a>
          </div>
        </div>
      </div>
    );
  }
}

