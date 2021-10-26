import React from 'react';
import Navigation from './Navigation';
import data from './config.json';
import "./Messages.css";
const PREFIX = (data.DEVELOPMENT) ? data.DEVELOPMENT_ROUTE_PREFIX : "";
import { FaPaperclip } from 'react-icons/fa';

export default class Messages extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            messages: [],
            image: false,
            currentMessageContent: '',
            currentImageContent: ''
        }

        fetch(`${PREFIX}/messages`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(raw => raw.json()).then(data => {
            this.setState({ messages: data.messages }, () => {
                this.scrollToLastMessage();
            })
        });
    }

    componentDidMount(){
        var imageInput = document.getElementById("imageInput");
        imageInput.onchange = () => {
            this.setState({
                currentMessageContent: imageInput.files[0].name,
                currentImageContent: imageInput.files[0],
                image: true
            });
            document.getElementById("message").disabled = true;
        };
    }

    scrollToLastMessage(){
        var messages = document.getElementsByClassName('message');
        if(messages.length > 0){
            console.log(messages[messages.length-1])
            messages[messages.length-1].scrollTo();
        }
    }

    sendMessage(event){
        event.preventDefault();
        var formData = new FormData();
        formData.append('image', this.state.currentImageContent)
        formData.append('content', this.state.currentMessageContent);

        fetch(`${PREFIX}/message`, {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: formData
        }).then(raw => raw.json()).then(data => {
            var c = this.state.messages;
            c.push(data);
            this.setState({ messages: c, currentMessageContent: '', currentImageContent: '' }, () => {
                this.scrollToLastMessage();
            });
        });
    }

    onImageInputClick(){
        document.getElementById("imageInput").click();
    }
    onInputChange(event){
        this.setState({ currentMessageContent: event.target.value });
    }

    render(){
        let pfp = require('../content/users/pfp.jpg');
        let messages = this.state.messages;
        return(
            <div id="parent">
                <Navigation location="message"/>
                <div className="messaging">
                    <div className="messaging-header">
                        <div className="header-content">
                            <img className="header-profile-image" src={pfp}/>
                            <span className="fw-normal fs-4">Jossie.JPEG</span>
                        </div>
                        <div className="header-actions">
                            <button className="btn btn-parimary">Send Tip
                                <i className="fa fa-money"></i>
                            </button>
                        </div>
                    </div>
                    <div className="message-box">
                        {messages.map((message, index) => {
                            let style = (message.from == "user") ? "incoming" : "outgoing";
                            let content = (message.content) ? <span className={style+"-text-box"}>{message.content}</span>:
                                <img className={style+"-img-content"} src={`${PREFIX}/content/${message.imageContent}`}/>;
                            return(
                                <div className={style+"-message message"} key={index}>
                                    <span className={style+"-user"}>{message.from}</span>
                                    <div className={style+"-message-content"}>
                                        <img src={`${PREFIX}/content/users/${message.image}`} className={style+"-user-img"}/>
                                        {content}
                                        <div className={style+"-info"}><span>{message.info}</span></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="send-message">
                        <form id="formMessage" onSubmit={this.sendMessage.bind(this)}>
                            <div className="input-group">
                                <span className="input-group-text" id="attachment" onClick={this.onImageInputClick}>
                                    <FaPaperclip/>
                                </span>
                                <input className="form-control" id="message" type="text" placeholder="Send message..." aria-label="message box" aria-describedby="sendMessage" name="message" value={this.state.currentMessageContent} onChange={this.onInputChange.bind(this)}/>
                                <input className="visually-hidden" id="imageInput" type="file" name="image"/>
                                <button className="btn btn-primary" id="sendMessage" type="submit">Send</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}