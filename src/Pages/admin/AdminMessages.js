import React from 'react';
import "bootstrap/js/src/tab";
import socketIOClient from 'socket.io-client';

import data from '../../../config.json';
const PREFIX = (data.DEVELOPMENT) ? data.DEVELOPMENT_ROUTE_PREFIX : "";
const PORT = (data.DEVELOPMENT) ? data.DEVELOPMENT_PORT : "3000";
import AdminNavigation from './AdminNavigation';
const socket = socketIOClient("http://127.0.0.1:"+PORT);

import { useMediaQuery } from 'react-responsive';
import { FaComment } from 'react-icons/fa';

const useMobileQuery = () => useMediaQuery({ query: '(max-width: 768px)' })
const Mobile = ({ children }) => {
    return useMobileQuery() ? children : null;
}
const useDesktopQuery = () => useMediaQuery({ query: '(min-width: 769px)' })
const Desktop = ({ children }) => {
    return useDesktopQuery() ? children : null;
}

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
        socket.on('chat message', data => {
            fetch(`${PREFIX}/admin/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({user: data.to})
            }).then(raw => raw.json()).then(response => {
                if(response.success){
                    var c = this.state.content;
                    var u;
                    if(c[data.from]){
                        c[data.from].push(data);
                        var index = this.state.names.indexOf(data.from);
                        u = this.state.unreadMessages;
                        if(!data.from == this.state.currentlyOpen) u[index] += 1;
                    } else {
                        c[data.from] = [];
                        c[data.from].push(data);
                        var n = this.state.names;
                        n.push(data.from);
                        var index = n.indexOf(data.from);
                        u = this.state.unreadMessages;
                        if(!data.from == this.state.currentlyOpen) u[index] += 1;
                        this.setState({ names: n });
                    }
                    this.setState({ content: c, unreadMessages: u });
                    this.scrollToLastMessage();
                }
            })
        });
    }

    componentDidMount(){
        fetch(`${PREFIX}/admin/message/ready`).then(res => res.json()).then(data => {
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
            this.setState({content: content, names: names, currentlyOpen: names[0], unreadMessages: unreadMessages}, () => {
                this.scrollToLastMessage();
            });
        });
    }

    scrollToLastMessage(){
        var message = document.getElementById('lastMessage');
        if(message){
            message.scrollIntoView();
        }
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
            this.setState({currentlyOpen: newOpen, current: c}, () => {
                this.scrollToLastMessage();
            });
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
            socket.emit('chat message', data);
            this.setState({content: current, messageContent: ''}, () => {
                this.scrollToLastMessage();
            });
        })
    }

    showInbox(){
        var inbox = document.getElementsByClassName("inbox-mobile")[0];
        inbox.classList.toggle("show-inbox");
    }

    render(){
        let content = this.state.content;
        let names = this.state.names;
        let unreadMessageBadges = this.state.unreadMessages;

        return(
            <div id="parent">
                <Desktop><AdminNavigation location="message"/></Desktop>
                <Mobile>
                    <AdminNavigation location="message" headerActions={<div><FaComment onClick={this.showInbox}/></div>}/>
                </Mobile>
                    <Desktop>
                    <div className="message-parent">
                        <div className="inbox nav flex-column" id="chat-inbox-navigation" role="tablist">
                            {names.length == 0 ?
                                <div className="inbox-user-parent blur">
                                    <img className="inbox-user-image" src={`${PREFIX}/content/users/default.jpg`}/>
                                    <div className="inbox-user-details"><span className="inbox-user-name">John Doe</span>
                                    <span className="inbox-user-message">random new message information</span></div>
                                    <div className="inbox-user-date-read">
                                        <div className="inbox-user-date">10:34 PM</div>
                                    </div>
                                </div>
                                : ""
                            }
                            {names.map((name, indx) => {
                                var lastI = content[name].length;
                                var lastMsg = (content[name][lastI-1].content) ? content[name][lastI-1].content : "Image";
                                var classN = (indx == 0) ? "inbox-user-parent active":"inbox-user-parent";
                                
                                return(
                                    <div onClick={this.onChange.bind(this, name)} key={"inbox_"+name} className={classN} id={"inbox-user-"+(indx+1)} data-bs-toggle="tab" data-bs-target={"#chat-"+(indx+1)+"-box"} type="button" role="tab" aria-controls={"chat-"+indx+"-box"} aria-selected={(indx == 0 ? "true" : "false")}>
                                        <img className="inbox-user-image" src={`${PREFIX}/content/users/${content[name][0].image}`}/>
                                        <div className={(content[name].some(messages => messages.read == false))?"inbox-user-details fw-bold":"inbox-user-details"}><span className="inbox-user-name">{name}</span>
                                        <span className="inbox-user-message">{lastMsg}</span></div>
                                        <div className="inbox-user-date-read">
                                            {(content[name][lastI-1].read) ? "" : <span className="badge bg-primary inbox-user-messages-badge">{unreadMessageBadges[indx]}</span>}
                                            <div className="inbox-user-date">10:34 PM</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="admin-messaging tab-content">
                        {(Object.keys(content).length == 0) ? <div id="empty-inbox"><span className="fw-bold fs-3">Inbox Empty</span></div> : ""}
                        {Object.values(content).map((messages, index) => {
                            var classN = (index == 0) ? "tab-pane admin-message-tab active":"tab-pane admin-message-tab";
                            return(
                                <div key={"messages-user-"+index} className={classN} id={"chat-"+(index+1)+"-box"} role="tabpanel" aria-labelledby={"inbox-user-"+index}>
                                    <div className="admin-message-box">
                                    {messages.map((message, index2) => {
                                        var msgType = (message.from == "jossiejpeg") ? "outgoing" : "incoming";
                                        let msgContent = (message.content) ? 
                                            <span className={msgType+"-text-box"}>{message.content}</span> : 
                                            <img className={msgType+"-image-content"} src={`${PREFIX}/content/${message.imageContent}`}/>;
                                        let lastMessageID = (index2 == messages.length - 1) && this.state.currentlyOpen == this.state.names[index] ? "lastMessage": "";
                                        return (
                                            <div className={msgType+"-message message"} key={index2} id={lastMessageID}>
                                                <span className={msgType+"-user"}>{message.from}</span>
                                                <div className={msgType+"-message-content"}>
                                                    <img className={msgType+"-user-img"} src={`${PREFIX}/content/users/${message.image}`}/>
                                                    {msgContent}
                                                    <div className={msgType+"-info"}><span>{message.date}</span></div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    </div>
                                </div>
                            )
                        })}
                        {names.length > 0 ? 
                        <div className="send-message">
                            <form id="formMessage" onSubmit={this.sendMessage.bind(this)}>
                                <div className="input-group">
                                    {/* <span className="input-group-text"><i className="fa fa-paperclip"></i></span> */}
                                    <input className="form-control" value={this.state.messageContent} onChange={this.setMessage.bind(this)} id="message" type="text" placeholder="Send message..." aria-label="Message box" aria-describedby="sendMessage" name="message" />
                                    <button className="btn btn-secondary" id="sendMessage" type="submit">Send</button>
                                </div>
                            </form>
                        </div>
                        :""}
                        </div>
                    </div>
                    </Desktop>
                    <Mobile>
                    <div className="message-parent-sm">
                        <div className="inbox-mobile nav flex-column" id="chat-inbox-navigation" role="tablist">
                            {names.length == 0 ?
                                <div className="inbox-user-parent blur">
                                    <img className="inbox-user-image" src={`${PREFIX}/content/users/default.jpg`}/>
                                    <div className="inbox-user-details"><span className="inbox-user-name">John Doe</span>
                                    <span className="inbox-user-message">random new message information</span></div>
                                    <div className="inbox-user-date-read">
                                        <div className="inbox-user-date">10:34 PM</div>
                                    </div>
                                </div>
                                : ""
                            }
                            {names.map((name, indx) => {
                                var lastI = content[name].length;
                                var lastMsg = (content[name][lastI-1].content) ? content[name][lastI-1].content : "Image";
                                var classN = (indx == 0) ? "inbox-user-parent active":"inbox-user-parent";
                                
                                return(
                                    <div onClick={this.onChange.bind(this, name)} key={"inbox_"+name} className={classN} id={"inbox-user-"+(indx+1)} data-bs-toggle="tab" data-bs-target={"#chat-"+(indx+1)+"-box"} type="button" role="tab" aria-controls={"chat-"+indx+"-box"} aria-selected={(indx == 0 ? "true" : "false")}>
                                        <img className="inbox-user-image" src={`${PREFIX}/content/users/${content[name][0].image}`}/>
                                        <div className={(content[name].some(messages => messages.read == false))?"inbox-user-details fw-bold":"inbox-user-details"}><span className="inbox-user-name">{name}</span>
                                        <span className="inbox-user-message">{lastMsg}</span></div>
                                        <div className="inbox-user-date-read">
                                            {(content[name][lastI-1].read) ? "" : <span className="badge bg-primary inbox-user-messages-badge">{unreadMessageBadges[indx]}</span>}
                                            <div className="inbox-user-date">10:34 PM</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="admin-messaging tab-content">
                            {(Object.keys(content).length == 0) ? <div id="empty-inbox"><span className="fw-bold fs-3">Inbox Empty</span></div> : ""}
                            {Object.values(content).map((messages, index) => {
                                var classN = (index == 0) ? "tab-pane admin-message-tab active":"tab-pane admin-message-tab";
                                return(
                                    <div key={"messages-user-"+index} className={classN} id={"chat-"+(index+1)+"-box"} role="tabpanel" aria-labelledby={"inbox-user-"+index}>
                                        <div className="admin-message-box">
                                        {messages.map((message, index2) => {
                                            var msgType = (message.from == "jossiejpeg") ? "outgoing" : "incoming";
                                            let msgContent = (message.content) ? 
                                                <span className={msgType+"-text-box"}>{message.content}</span> : 
                                                <img className={msgType+"-image-content"} src={`${PREFIX}/content/${message.imageContent}`}/>;
                                            let lastMessageID = (index2 == messages.length - 1) && this.state.currentlyOpen == this.state.names[index] ? "lastMessage": "";
                                            return (
                                                <div className={msgType+"-message message"} key={index2} id={lastMessageID}>
                                                    <span className={msgType+"-user"}>{message.from}</span>
                                                    <div className={msgType+"-message-content"}>
                                                        <img className={msgType+"-user-img"} src={`${PREFIX}/content/users/${message.image}`}/>
                                                        {msgContent}
                                                        <div className={msgType+"-info"}><span>{message.date}</span></div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        </div>
                                    </div>
                                )
                            })}
                            {names.length > 0 ? 
                            <div className="send-message">
                                <form id="formMessage" onSubmit={this.sendMessage.bind(this)}>
                                    <div className="input-group">
                                        {/* <span className="input-group-text"><i className="fa fa-paperclip"></i></span> */}
                                        <input className="form-control" value={this.state.messageContent} onChange={this.setMessage.bind(this)} id="message" type="text" placeholder="Send message..." aria-label="Message box" aria-describedby="sendMessage" name="message" />
                                        <button className="btn btn-secondary" id="sendMessage" type="submit">Send</button>
                                    </div>
                                </form>
                            </div>
                            :""}
                        </div>
                    </div>
                    </Mobile>
            </div>
        )
    }
}