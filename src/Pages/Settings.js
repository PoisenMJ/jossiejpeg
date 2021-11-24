import React from "react";
import Navigation from "./Navigation";

export default class Settings extends React.Component{
    constructor(props){
        super(props);
        this.state = {

        };
    }

    render(){
        return(
            <div id="parent">
                <Navigation location="settings"/>
                <div id="settings">
                    
                </div>
            </div>
        );
    }
}