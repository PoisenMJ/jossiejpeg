import React from 'react';
import AdminNavigation from './AdminNavigation';
import { route_prefix } from '../../../utility';

export default class AdminModeration extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            allUsers: [],
            filteredUsers: [],
            currentlyActive: '',
            searchTerm: ''
        }
        this.getAllUsers();
        this.search = this.search.bind(this);
    }

    getAllUsers(){
        fetch(`${route_prefix}/admin/all-users`).then(raw => raw.json()).then(data => {
            console.log(data);
            this.setState({allUsers: data, filteredUsers: data});
        })
    }

    userClick(user, event){
        var e = (event.target.classList.contains("admin-moderation-user")) ?
            event.target : event.target.parentElement;
        if(e.classList.contains("active")) this.setState({ currentlyActive: '' })
        else this.setState({ currentlyActive: user });
        
        // change styling for current active class
        if(!event.target.classList.contains("admin-moderation-user")){
            var others = document.getElementsByClassName("admin-moderation-user");
            for(let i in others){
                if(others[i].classList && others[i] != event.target.parentElement) others[i].classList.remove("active");
            }
            event.target.parentElement.classList.toggle("active");
        } else{
            var others = document.getElementsByClassName("admin-moderation-user");
            for(let i in others){
                if(others[i].classList && others[i] != event.target) others[i].classList.remove("active");
            }
            event.target.classList.toggle("active");
        }
    }

    ban(){
        fetch(`${route_prefix}/admin/ban/${this.state.currentlyActive}`).then(raw => raw.json()).then(data => {
            console.log(data);
        })
    }

    search(event){
        var value = event.target.value.toLowerCase();
        var filtered = this.state.allUsers.filter((e) => {
            var email = e.email.toLowerCase().search(value) != -1;
            var username = e.username.toLowerCase().search(value) != -1;
            return email || username;
        });
        console.log(filtered);
        this.setState({ filteredUsers: filtered });
    }

    render(){
        var banDisabled = (this.state.currentlyActive) ? false : true;
        return(
            <div id="parent">
                <AdminNavigation location="moderation"/>
                <div id="admin-moderation">
                    <div id="admin-moderation-user-list">
                        <input className="form-control" placeholder="search" onChange={this.search}/>
                        {
                            this.state.filteredUsers.map((user, index) => {
                                return(
                                    <div key={index} className="admin-moderation-user" onClick={this.userClick.bind(this, user.email)}>
                                        <span className="overflow-check">{user.email}</span>
                                        <span className="overflow-check">{user.username}</span>
                                        <span className="overflow-check">{user.firstName}</span>
                                        <span className="overflow-check">{user.lastName}</span>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div id="admin-moderation-actions">
                        <button onClick={this.ban.bind(this)} disabled={banDisabled} className="btn btn-danger w-100 h-100">BAN</button>
                    </div>
                </div>
            </div>
        )
    }
}