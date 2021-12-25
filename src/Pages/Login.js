import React from 'react';
import {route_prefix} from '../../utility';
import CreateAccountBox from '../Components/CreateAccountBox';
import {flash} from 'react-universal-flash';

export default class Login extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            createAccount: false
        }
        this.login = this.login.bind(this);
        var params = new URLSearchParams(window.location.search.substr(1, window.location.search.length));
        if(params.get('failure')){
            console.log("HI");
            flash("Incorrect Credentials", 10000, "red")
        }
    }

    createAccount(){
        this.setState({ createAccount: true });
    }
    goToLogin(){
        this.setState({ createAccount: false });
    }


    login(){
        fetch(`${route_prefix}/submit-login`, {
            method: "POST",
            body: new FormData(document.getElementById("loginForm"))
        })
    }

    accountCreated(){
        this.setState({ createAccount: false });
        flash("Account Created", 10000, "green");
    }

    render(){
        return(
            <div id="parent">
                <div id="login">
                    <img className="login-image im1" src={`${route_prefix}/content/images/image1.jpg`}/>
                    <div id="login-content">
                        <div className="mb-5">
                            <span className="text-black fs-1 fw-lighter">Jossi</span>
                            <span className="fs-1 fw-light"> . </span>
                            <span className="text-primary fs-1">JPEG</span>
                        </div>
                        <div className="mb-4">
                            {!this.state.createAccount ?
                                <legend className="mb-3">Log In</legend> 
                                :
                                <legend className="mb-3">Create Account</legend>
                            }
                            {!this.state.createAccount ?
                                <form id="loginForm" action={`${route_prefix}/login`} method="POST">
                                    <input
                                        className="form-control mb-2"
                                        name="email"
                                        type="email"
                                        placeholder="email"
                                    />
                                    <input
                                        className="form-control mb-3"
                                        name="password"
                                        type="password"
                                        placeholder="password"
                                    />
                                    <button
                                        className="btn btn-primary mb-2 w-100"
                                        type="submit"
                                    >Login</button>
                                </form>
                                :
                                <CreateAccountBox onCreate={this.accountCreated.bind(this)}/>
                            }
                        </div>
                        {!this.state.createAccount ?
                            <div>
                                <span className="text-muted">Don't have an account?</span>
                                <br></br>
                                <a onClick={this.createAccount.bind(this)} id="createAccount" className="mt-2 fw-bold text-primary">Create an Account</a>
                            </div>
                        :
                            <div>
                                <span className="text-muted">Already have an account?</span>
                                <br></br>
                                <a className="text-primary fw-bold" style={{cursor: 'pointer'}} onClick={this.goToLogin.bind(this)}>Login</a>
                            </div>
                        }
                    </div>
                    <img className="login-image im2" src={`${route_prefix}/content/images/image2.jpg`}/>
                </div>
            </div>
        )
    }
}