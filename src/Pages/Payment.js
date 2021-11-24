import React from 'react';
import data from '../../config.json';
const PREFIX = (data.DEVELOPMENT) ? '/api' : '';
import { PaymentInputsContainer } from 'react-payment-inputs';

export default class Payment extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            email: '',
            cardNumber: '',
            cvc: '',
            expiry: '',
            cardholder: ''
        }
    }

    handleInputChange(event){
        switch(event.target.name){
            case "email":
                this.setState({ email: event.target.value });
                break;
            case "cardholder":
                this.setState({ cardholder: event.target.value });
                break;
            case "cvc":
                this.setState({ cvc: event.target.value });
                break;
            case "expiry":
                this.setState({ expiry: event.target.value });
                break;
            case "cardNumber":
                this.setState({ cardNumber: event.target.value });
                break;
            default:
                console.log(event.target);
        }
    }

    handleSubmit(event){
        event.preventDefault();
        const cardNumber = encodeURIComponent(this.state.cardNumber);
        const expiry = encodeURIComponent(this.state.expiry);
        const cardHolder = encodeURIComponent(this.state.cardholder);
        const email = encodeURIComponent(this.state.email);
        const cvc = encodeURIComponent(this.state.cvc);
        const formData = `cardNumber=${cardNumber}&cvc=${cvc}&expiry=${expiry}&cardholder=${cardHolder}&email=${email}`;
        fetch(`${PREFIX}/payment/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
        });
    }

    handleCvcChange(event){
        this.setState({ cvc: event.target.value });
    }
    handleExpiryChange(event){
        this.setState({ expiry: event.target.value });
    }
    handleCardNumberChange(event){
        this.setState({ cardNumber: event.target.value });
    }

    render(){
        return(
            <main className="page payment-page">
                <section className="payment-form dark">
                <div className="container">
                    <div className="block-heading">
                    <h2>Payment</h2>
                    <p>Subscribe to Jossie.JPEG, 1-Month Reaccuring Subscription</p>
                    </div>
                    {/* <form onSubmit={this.handleSubmit.bind(this)}> */}
                    <form action={`${PREFIX}/payment/subscribe`} method="post">
                        <div className="products">
                            <h3 className="title">Checkout</h3>
                            <div className="item">
                                <span className="price">$12</span>
                                <p className="item-name">Jossie Subscription</p>
                                <p className="item-description">1 Month</p>
                            </div>
                            <div className="total">Total<span className="price">$12</span></div>
                        </div>
                        <div className="card-details">
                                <PaymentInputsContainer>
                                {({ meta, getCardNumberProps, getExpiryDateProps, getCVCProps }) => (
                                    <div>
                                        <h3 className="title">Credit Card Details</h3>
                                        <div className="row">
                                            <div className="col-sm-12 mb-2">
                                                <label htmlFor="email-address">Email</label>
                                                <input onChange={this.handleInputChange.bind(this)} name="email" id="email-address" type="email" className="form-control" placeholder="user@provider.com" aria-label="Email Address"/>
                                            </div>
                                            <div className="form-group col-sm-9 mb-2">
                                                <label htmlFor="card-holder">Card Holder</label>
                                                <input onChange={this.handleInputChange.bind(this)} name="cardholder" id="card-holder" type="text" className="form-control" placeholder="Card Holder" aria-label="Card Holder" aria-describedby="basic-addon1"/>
                                            </div>
                                            <div className="form-group col-sm-3">
                                                <label htmlFor="expire">Expiry</label> 
                                                <input {...getExpiryDateProps({ onChange: this.handleExpiryChange.bind(this) })} id="expire" name="expiry" type="text" className="form-control" placeholder="MM" aria-label="MM" aria-describedby="basic-addon1"/>
                                            </div>
                                            <div className="form-group col-sm-8">
                                                <label htmlFor="card-number">Card Number</label>
                                                <input className="form-control" {...getCardNumberProps({ onChange: this.handleCardNumberChange.bind(this) })} name="cardNumber" id="cardNumber" placeholder="0000 0000 0000 0000" value={this.state.cardNumber}/>
                                                {meta.isTouched && meta.error && <span>Error: {meta.error}</span>}
                                            </div>
                                            <div className="form-group col-sm-4">
                                                <label htmlFor="cvc">CVC</label>
                                                <input {...getCVCProps({ onChange: this.handleCvcChange.bind(this) })} name="cvc" id="cvc" type="text" className="form-control" placeholder="CVC" aria-label="Card Holder" aria-describedby="basic-addon1"/>
                                            </div>
                                            <button type="submit" className="btn btn-primary btn-block">Pay</button>
                                        </div>
                                    </div>
                                )}
                                </PaymentInputsContainer>
                                {/* <input name="card-number" id="card-number" type="number" maxlength="16" class="form-control" placeholder="Card Number" aria-label="Card Holder" aria-describedby="basic-addon1"/> */}
                        </div>
                    </form>
                </div>
                </section>
            </main>
        );
    }
}