import React from 'react';
import { FaUpload, FaEnvelope, FaBars, FaSignOutAlt, FaSmile, FaMoneyBillWave } from 'react-icons/fa';
import data from '../../../config.json';
const PREFIX = (data.DEVELOPMENT) ? data.DEVELOPMENT_ROUTE_PREFIX : '';

export default class AdminNavigation extends React.Component{
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
        return (
            <div>
                <header className="header" id="header">
                    <div className="header_toggle" onClick={() => this.openSideBar("nav-bar")}><FaBars id="admin-nav-toggle"/> </div>
                    {/* <div className="header_img"> <img src={`${PREFIX}/content/users/pfp.jpg`} alt=""/> </div> */}
                    {this.props.headerActions}
                </header>
                <div className="l-navbar" id="nav-bar">
                    <nav className="nav">
                        <div>
                            <a href="#" className="nav_logo">
                                <FaSmile className="nav_logo-icon"/>
                                <span className="nav_logo-name">Jossie.JPEG</span>
                            </a>
                            <div className="nav_list">
                                <a href="/admin/upload" className={this.getClass("upload")}>
                                    <FaUpload style={{marginRight: "8px", marginBottom: "4px"}}/>
                                    <span className="nav_name">Upload</span>
                                </a>
                                <a href="/admin/message" className={this.getClass("message")}>
                                    <FaEnvelope style={{marginRight: "8px", marginBottom: "4px"}}/>
                                    <span className="nav_name">Message</span>
                                </a>
                                <a href="/admin/statements" className={this.getClass("statements")}>
                                    <FaMoneyBillWave style={{marginRight: "8px", marginBottom: "4px"}}/>
                                    <span className="nav_name">Statements</span>
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
        )
    }
}