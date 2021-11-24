import React from 'react';
import { Alert } from 'react-bootstrap';

export default class MessageFlash extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            message: this.props.message,
            variant: this.props.variant,
            show: false
        }
        this.showMessage = this.showMessage.bind(this);
    }

    showMessage(){
        this.setState({ show: true });
        setTimeout(() => {
            this.setState({ show: false });
        }, this.props.time*1000)
}

    render(){
        return(
            <div id="message-flash">
                {this.state.show ? 
                    <Alert variant={this.state.variant}>
                        {this.state.message}
                    </Alert>
                :''}
            </div>
        );
    }
}