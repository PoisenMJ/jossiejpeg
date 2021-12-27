import React from 'react';
import { FaHome, FaEnvelope, FaBars, FaSmile, FaSignOutAlt, FaCog, FaImage } from 'react-icons/fa';

export default class Navigation extends React.Component{
    getClass(name){
        var active = "nav_link nav_link-active";
        var inactive = "nav_link";
        return (this.props.location == name) ? active : inactive;
    }

    openSideBar(toggleId, navId, headerId){
        const toggle = document.getElementById(toggleId),
        nav = document.getElementById(navId),
        // bodypd = document.getElementById(bodyId),
        headerpd = document.getElementById(headerId)
        
        // Validate that all variables exist
        if(toggle && nav && headerpd){
            toggle.addEventListener('click', ()=>{
                // show navbar
                nav.classList.toggle('show')
                // change icon
                toggle.classList.toggle('bx-x')
                // add padding to body
                // bodypd.classList.toggle('body-pd')
                // add padding to header
                headerpd.classList.toggle('body-pd')
            })
        }
    }

    constructor(props){
        super(props);
    }

    componentDidMount(){
        this.openSideBar("admin-nav-toggle", "nav-bar", "header");
    }

    render(){ 
        return(
            <div>
                <header className="header" id="header">
                    <div className="header_toggle" onClick={() => this.openSideBar("nav-bar")}><FaBars id="admin-nav-toggle"/> </div>
                    {this.props.headerContent}
                    {this.props.headerActions}
                </header>
                <div className="l-navbar" id="nav-bar">
                    <nav className="nav">
                        <div>
                            <a href="#" className="nav_logo">
                                <FaSmile className="nav_logo-icon"/>
                                <span className="nav_logo-name">Jossi.JPEG</span>
                            </a>
                            <div className="nav_list">
                                <a href="/home" className={this.getClass("home")}>
                                    <FaHome style={{marginRight: "8px", marginBottom: "4px"}}/>
                                    <span className="nav_name">Home</span>
                                </a>
                                <a href="/message" className={this.getClass("message")}>
                                    <FaEnvelope style={{marginRight: "8px", marginBottom: "4px"}}/>
                                    <span className="nav_name">Message</span>
                                </a>
                                <a href="/settings" className={this.getClass("settings")}>
                                    <FaCog style={{marginRight: "8px", marginBottom: "4px"}}/>
                                    <span className="nav_name">Settings</span>
                                </a>
                                <a href="/gallery" className={this.getClass("gallery")}>
                                    <FaImage style={{marginRight: "8px", marginBottom: "4px"}}/>
                                    <span className="nav_name">Gallery</span>
                                </a>
                            </div>
                        </div>
                        <a href="/signout" className="nav_link">
                            <FaSignOutAlt/>
                            <span className="nav_name">Log Out</span>
                        </a>
                    </nav>
                </div>
            </div>
        );
    }
}