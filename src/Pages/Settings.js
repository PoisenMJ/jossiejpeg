import React from "react";
import route_prefix from "../../utility";
import Navigation from "./Navigation";
import {flash} from 'react-universal-flash';

export default class Settings extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            username: '',
            image: '',
            firstName: '',
            lastName: '',
            newPasswordInput: '',
            newPasswordConfirmInput: '',
            newImage: false
        };
        this.getUserInfo();
        this.getDefaultCard();
    }
    
    componentDidMount(){
        var imageInput = document.getElementById('userImage');
        console.log(imageInput);
        imageInput.onchange = () => {
            this.setState({
                image: imageInput.files[0],
                newImage: true
            });
        }
    }

    getUserInfo(){
        fetch(`${route_prefix}/user`).then(raw => raw.json()).then(data => {
            // check if data status code 200
            console.log(data);
            this.setState({
                username: data.username,
                image: data.image,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                cards: [],
                defaultCard: {}
            })
        })
    }

    updateInput(event){
        switch(event.target.id){
            case "password":
                this.setState({ newPasswordInput: event.target.value });
                break;
            case "confirm_password":
                this.setState({ newPasswordConfirmInput: event.target.value });
                break;
        }
    }

    openImageInput(){
        document.getElementById("userImage").click();
        console.log(document.getElementById("userImage"));
    }

    getDefaultCard(){
        fetch(`${route_prefix}/payment/stripe/get-default-payment-method`).then(raw => raw.json()).then(data => {
            this.setState({ defaultCard: data });
        })
    }

    saveProfile(event){
        event.preventDefault();
        var p = document.getElementById("password").value;
        var cp = document.getElementById("confirm_password").value;
        if(p != cp) flash("Passwords Don't Match", 10000, "red");

        var formData = new FormData();
        if(this.state.newPasswordInput) formData.append("password", this.state.newPasswordInput);
        if(this.state.newImage) formData.append('userImage', this.state.image);

        fetch(`${route_prefix}/user/update`, {
            method: "POST",
            body: formData
        }).then(raw => raw.json()).then(data => {
            if(data.success) flash("Updated", 10000, "green");
            else flash("Update Failed", 10000, "red");
        })
    }

    render(){
        let imageURI = (this.state.newImage) ? URL.createObjectURL(this.state.image) : 
            `${route_prefix}/content/users/${this.state.image}`;
        let cardNumber = "•••• •••• •••• ••••";
        let cardExpiry = "--/--";
        let brand = "Brand";
        if(this.state.defaultCard)
            if(this.state.defaultCard.lastFour){
                cardNumber = "•••• •••• •••• "+this.state.defaultCard.lastFour;
                cardExpiry = this.state.defaultCard.exp_month+'/'+this.state.defaultCard.exp_year;
                brand = this.state.defaultCard.brand;
            }

        return(
            <div id="parent">
                <Navigation location="settings"/>
                <div id="settings">
                    <form id="updateUserForm">
                    <div className="container rounded bg-white mt-5">
                        <div className="row">
                            <div className="col-md-4 border-right">
                                <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                                    <img onClick={this.openImageInput.bind(this)} className="user-settings-image rounded-circle mt-5" src={imageURI} width="90" height="90"/>
                                    <input type="file" className="visually-hidden" id="userImage"/>
                                    <span className="text-muted text-waver mt-1">click</span>
                                    <span className="font-weight-bold">{this.state.username}</span>
                                    <span className="text-black-50">{this.state.email}</span>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="p-3 py-5">
                                    <div className="row mt-2">
                                        <div className="col-sm-3 mb-1">
                                            <input type="text"
                                                disabled
                                                className="form-control"
                                                placeholder={this.state.username}/>
                                        </div>
                                        <div className="col-sm-3">
                                            <input type="text"
                                                className="form-control"
                                                disabled
                                                placeholder={this.state.email}/>
                                        </div>
                                    </div>
                                    <div className="row mt-4">
                                        <span className="mb-1">Update Password</span>
                                        <div className="col-sm-12">
                                            <input type="password"
                                                name="password"
                                                id="password"
                                                className="form-control"
                                                placeholder="new password"
                                                value={this.state.newPasswordInput}
                                                onChange={this.updateInput.bind(this)}/>
                                        </div>
                                        <div className="col-sm-12 mt-1">
                                            <input type="password"
                                                id="confirm_password"
                                                className="form-control"
                                                placeholder="confirm new password"
                                                value={this.state.newPasswordConfirmInput}
                                                onChange={this.updateInput.bind(this)}/>
                                        </div>
                                    </div>
                                    <div className="row g-0 mt-4">
                                        <span className="mb-1">Payment</span>
                                        <div id="default-card">
                                            <span>{cardNumber}</span>
                                            <span style={{float: 'right'}}>{cardExpiry}</span>
                                            <span id="default-card-brand">{brand}</span>
                                        </div>
                                    </div>
                                    <div className="mt-5 text-right">
                                        <button onClick={this.saveProfile.bind(this)} className="btn btn-primary profile-button" type="button">Save</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                </div>
            </div>
        );
    }
}