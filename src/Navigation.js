import React from 'react';
import "./Navigation.css";
import { FaHome, FaEnvelope, FaUser } from 'react-icons/fa';

export default class Navigation extends React.Component{
    getClass(name){
        let a = "list-group-item list-group-item-action py-2 ripple";
        let b = "list-group-item list-group-item-action py-2 ripple active";
        return (this.props.location == name) ? b : a;
    }

    render(){ 
        return(
            <div className="position-sticky sidebar">
                <div className="list-group list-group-flush mx-3 mt-4">
                    <a className={this.getClass("home")} href="/home">
                        <FaHome className="icon"/>
                        <span>Home</span>
                    </a>
                    <a className={this.getClass("message")} href="/message">
                        <FaEnvelope className="icon"/>
                        <span>Message</span>
                    </a>
                </div>
            </div>
        );
    }
}