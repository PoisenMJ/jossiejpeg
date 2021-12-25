import React from 'react';
import { route_prefix } from '../../utility';
import { flash } from 'react-universal-flash';

export default class CreateAccountBox extends React.Component{
    sendForm(event){
        event.preventDefault();
        var p = document.getElementById("password").value;
        var cp = document.getElementById("confirmPassword").value;
        var username = document.getElementById("username").value;
        var email = document.getElementById("email").value;
        var firstName = document.getElementById("firstName").value;
        var lastName = document.getElementById("lastName").value;

        if(p && cp && username && email && firstName &&lastName){
            if(!(p == cp)){
                flash("Password don't match", 10000, "red");
            } else {
                fetch(`${route_prefix}/create-account`, {
                    method: "POST",
                    body: new FormData(document.getElementById("createAccountForm"))
                }).then(raw => raw.json()).then(data => {
                    if(data.success){
                        this.props.onCreate();
                    } else if(!data.success) {
                        flash(data.message, 10000, "red");
                    }
                });
            }
        } else {
            flash("Fill out all fields", 10000, "red");
        }

    }

    render(){
        return(
            <form id="createAccountForm">
                <div className="row g-2 mb-2">
                    <div className="col">
                        <input
                            className="form-control"
                            name="firstName"
                            placeholder="First Name"
                            id="firstName"
                        />
                    </div>
                    <div className="col">
                        <input
                            className="form-control"
                            name="lastName"
                            placeholder="Last Name"
                            id="lastName"
                        />
                    </div>
                </div>
                <input
                    className="form-control mb-2"
                    name="email"
                    placeholder="email@provider.com"
                    id="email"
                />
                <input
                    className="form-control mb-2"
                    name="username"
                    placeholder="Username"
                    id="username"
                />
                <input
                    className="form-control mb-2"
                    name="password"
                    type="password"
                    placeholder="Password"
                    id="password"
                />
                <input
                    className="form-control mb-4"
                    type="password"
                    placeholder="Confirm Password"
                    id="confirmPassword"
                />
                <button onClick={this.sendForm.bind(this)} className="btn btn-primary w-100">Create</button>
            </form>
        )
    }
}