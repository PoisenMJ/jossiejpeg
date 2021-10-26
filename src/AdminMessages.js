import React from 'react';
// import ReactDOM from 'react-dom';
import "./AdminMessages.css";
import "bootstrap/js/src/tab";

import data from './config.json';
const PREFIX = (data.DEVELOPMENT) ? data.DEVELOPMENT_ROUTE_PREFIX : "";

import AdminNavigation from './AdminNavigation';

export default class AdminMessages extends React.Component{

    constructor(props){
        super(props);
        this.onChange.bind(this);
        this.state = {
            content: [],
            names: [],
            currentlyOpen: '',
            messageContent: '',
            unreadMessages: []
        }
    }

    componentDidMount(){
        fetch(`${PREFIX}/getAdminMessageReady`).then(res => res.json()).then(data => {
            var content = JSON.parse(data.content);
            var names = Object.keys(content);
            let unreadMessages = [];
            for(var i = 0; i < Object.keys(content).length; i++){
                unreadMessages.push(0);
                for(var j = 0; j < Object.values(content)[i].length; j++){
                    if(i == 0) content[Object.keys(content)[i]][j].read = true;
                    if(Object.values(content)[i][j].read == false) unreadMessages[i]+=1;
                }
            }
            this.setState({content: content, names: names, currentlyOpen: names[0], unreadMessages: unreadMessages});
        });
    }

    onChange(newOpen){
        fetch(`${PREFIX}/message/read`, {
            method: "POST",
            body: JSON.stringify({
                user1: newOpen,
                user2: "jossiejpeg"
            }),
            headers: {
                'Content-Type': "application/json"
            }
        }).then(raw => {
            var c = this.state.content;
            for(var i = 0; i < c[newOpen].length; i++){
                c[newOpen][i].read = true;
            }
            console.log(this.state);
            this.setState({currentlyOpen: newOpen, current: c});
        });
    }

    setMessage(event){
        this.setState({messageContent: event.target.value});
    }

    sendMessage(event){
        event.preventDefault();
        fetch(`${PREFIX}/admin/message`, { 
            method: "POST",
            body: JSON.stringify({
                content: this.state.messageContent,
                to: this.state.currentlyOpen
            }),
            headers: {
                'Content-Type': "application/json"
            }
        }).then(raw => raw.json()).then(data => {
            var current = this.state.content;
            current[this.state.currentlyOpen].push(data);
            this.setState({content: current, messageContent: ''});
        })
    }

    render(){
        let content = this.state.content;
        let names = this.state.names;
        let unreadMessageBadges = this.state.unreadMessages;
        
        return(
            <div id="parent">
                <AdminNavigation location="message"/>
                <div class="message-parent">
                    <div class="inbox nav flex-column" id="chat-inbox-navigation" role="tablist">
                        {names.map((name, indx) => {
                            var lastI = content[name].length;
                            var lastMsg = (content[name][lastI-1].content) ? content[name][lastI-1].content : "Image";
                            var classN = (indx == 0) ? "inbox-user-parent active":"inbox-user-parent";
                            
                            return(
                                <div onClick={this.onChange.bind(this, name)} key={"inbox_"+name} class={classN} id={"inbox-user-"+(indx+1)} data-bs-toggle="tab" data-bs-target={"#chat-"+(indx+1)+"-box"} type="button" role="tab" aria-controls={"chat-"+indx+"-box"} aria-selected={(indx == 0 ? "true" : "false")}>
                                    <img class="inbox-user-image" src={`${PREFIX}/content/users/${content[name][0].image}`}/>
                                    <div class={(content[name].some(messages => messages.read == false))?"inbox-user-details fw-bold":"inbox-user-details"}><span class="inbox-user-name">{name}</span>
                                    <span class="inbox-user-message">{lastMsg}</span></div>
                                    <div class="inbox-user-date-read">
                                        {(content[name][lastI-1].read) ? "" : <span class="badge bg-primary inbox-user-messages-badge">{unreadMessageBadges[indx]}</span>}
                                        <div class="inbox-user-date">10:34 PM</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div class="admin-messaging tab-content">
                        {(Object.keys(content).length == 0) ? <div className="messages-user-empty"></div> : ""}
                        {Object.values(content).map((messages, index) => {
                            var classN = (index == 0) ? "tab-pane active":"tab-pane";
                            return(
                                <div key={"messages-user-"+index} class={classN} id={"chat-"+(index+1)+"-box"} role="tabpanel" aria-labelledby={"inbox-user-"+index}>
                                    <div class="message-box">
                                    {messages.map((message, index2) => {
                                        var msgType = (message.from == "jossiejpeg") ? "outgoing" : "incoming";
                                        let msgContent = (message.content) ? 
                                            <span class={msgType+"-text-box"}>{message.content}</span> : 
                                            <img class={msgType+"-image-content"} src={`${PREFIX}/content/${message.imageContent}`}/>;
                                        return (
                                            <div class={msgType+"-message"} key={index2}>
                                                <span class={msgType+"-user"}>{message.from}</span>
                                                <div class={msgType+"-message-content"}>
                                                    <img class={msgType+"-user-img"} src={`${PREFIX}/content/users/${message.image}`}/>
                                                    {msgContent}
                                                    <div class={msgType+"-info"}><span>{message.date}</span></div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    </div>
                                </div>
                            )
                        })}
                        <div class="send-message">
                            <form id="formMessage" onSubmit={this.sendMessage.bind(this)}>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="fa fa-paperclip"></i></span>
                                    <input class="form-control" value={this.state.messageContent} onChange={this.setMessage.bind(this)} id="message" type="text" placeholder="Send message..." aria-label="Message box" aria-describedby="sendMessage" name="message" />
                                    <button class="btn btn-primary" id="sendMessage" type="submit">Send</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                
                    
            </div>
        )
    }
}