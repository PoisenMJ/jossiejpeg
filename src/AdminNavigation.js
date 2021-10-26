import React from 'react';
import { FaUpload, FaEnvelope } from 'react-icons/fa';

export default class AdminNavigation extends React.Component{
    getClass(name){
        var active = "list-group-item list-group-item-action py-2 ripple active";
        var inactive = "list-group-item list-group-item-action py-2 ripple";
        return (this.props.location == name) ? active : inactive;
    }

    render(){
        return (
            <nav className="collapse d-lg-block sidebar collapse bg-white" id="sidebarMenu"> 
                <div className="position-sticky">
                    <div className="list-group list-group-flush mx-3 mt-4">
                        <a className={this.getClass("upload")} href="/admin/upload">
                            <FaUpload style={{marginRight: "8px", marginBottom: "4px"}}/>
                            <span>Upload</span>
                        </a>
                        <a className={this.getClass("message")} href="/admin/message">
                            <FaEnvelope style={{marginRight: "8px", marginBottom: "4px"}}/>
                            <span>Message</span>
                        </a>
                    </div>
                </div>
            </nav>
        )
    }
}