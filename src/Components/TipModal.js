import React from 'react';
import { route_prefix } from '../../utility';
import { Modal, Button } from 'react-bootstrap';
import CurrencyFormat from 'react-currency-format';

export default class TipModal extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            amount: '',
            message: '',
            show: false
        }
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
    }

    sendPayment(){
        var formData = `amount=${encodeURIComponent(this.state.amount)}&from=${this.props.from}&message=${this.state.message}`;
        fetch(`${route_prefix}/payment/tip`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData
        }).then(raw => {
            if(raw.status == 401){
                this.props.onFail();
                this.setState({ show: false });
            } else return raw.json()
        }).then(data => {
            if(data){
                this.props.onSuccess(data);
                this.setState({ show: false });
            }
        })
    }
    openDialog(){ this.setState({ show: true })}
    closeDialog(){ this.setState({ show: false })}
    onMessageChange(event){ this.setState({ message: event.target.value})}
    render(){
        return(
            <Modal show={this.state.show} animation={false} onHide={this.closeDialog}>
                <Modal.Header closeButton>
                    <Modal.Title>Tip</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-2">
                        <label htmlFor="tip" className="form-label">Amount:</label>
                        <CurrencyFormat id="tip" name="amount" className="form-control" allowNegative={false} placeholder="$0.00" value={this.state.amount} displayType={'input'} decimalScale={2} prefix={'$'} onValueChange={(values) => {
                            const {formattedValue, value} = values;
                            this.setState({amount: value})
                        }}/>
                    </div>
                    <div className="mb-2">
                        <label htmlFor="tipMessage" className="form-label">Message:</label>
                        <textarea id="tipMessage" value={this.state.message} onChange={this.onMessageChange.bind(this)} type="text" name="message" className="form-control"/>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.closeDialog.bind(this)}>Cancel</Button>
                    <Button onClick={this.sendPayment.bind(this)}>Tip</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}