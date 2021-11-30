import React from "react";
import route_prefix from "../../utility";
import Navigation from "./Navigation";

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
        switch(event.target.name){
            case "username":
                this.setState({ username: event.target.value });
                break;
            case "newpassword":
                this.setState({ newPasswordInput: event.target.value });
                break;
            case "newpasswordconfirm":
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

    saveProfile(){
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
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex flex-row align-items-center back"><i className="fa fa-long-arrow-left mr-1 mb-1"></i>
                                            <h6>Back to home</h6>
                                        </div>
                                        <h6 className="text-right">Edit Profile</h6>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-sm-3 mb-1">
                                            <input type="text"
                                                className="form-control"
                                                value={this.state.username}
                                                name="username"
                                                onChange={this.updateInput.bind(this)}/>
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
                                                className="form-control"
                                                placeholder="new password"
                                                value={this.state.newPasswordInput}
                                                name="newpassword"
                                                onChange={this.updateInput.bind(this)}/>
                                        </div>
                                        <div className="col-sm-12 mt-1">
                                            <input type="password"
                                                className="form-control"
                                                placeholder="confirm new password"
                                                value={this.state.newPasswordConfirmInput}
                                                name="newpasswordconfirm"
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
                                    {/* <div className="row mt-3">
                                        <div className="col-md-6">
                                            <input type="text" className="form-control" placeholder="address" value="D-113, right avenue block, CA,USA"/>
                                        </div>
                                        <div className="col-md-6">
                                            <input type="text" className="form-control" value="USA" placeholder="Country"/>
                                        </div>
                                    </div> */}
                                    {/* <div className="row mt-3">
                                        <div className="col-md-6"><input type="text" className="form-control" placeholder="Bank Name" value="Bank of America"/></div>
                                        <div className="col-md-6"><input type="text" className="form-control" value="043958409584095" placeholder="Account Number"/></div>
                                    </div> */}
                                    <div className="mt-5 text-right">
                                        <button onClick={this.saveProfile.bind(this)} className="btn btn-primary profile-button" type="button">Save</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}