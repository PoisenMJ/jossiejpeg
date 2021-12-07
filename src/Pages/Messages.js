import React from 'react';
import Navigation from './Navigation';
import data from '../../config.json';
const PREFIX = (data.DEVELOPMENT) ? data.DEVELOPMENT_ROUTE_PREFIX : "";
import { FaPaperclip, FaMoneyBillWave } from 'react-icons/fa';
import socketIOClient from 'socket.io-client';
const PORT = (data.DEVELOPMENT) ? data.DEVELOPMENT_PORT : "3000";
const socket = socketIOClient("http://127.0.0.1:"+PORT);
import TipModal from '../Components/TipModal';
import {flash} from 'react-universal-flash';

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
            console.log(data);
            this.setState({ messages: data.messages }, () => {
                this.scrollToLastMessage();
            })
        });

        socket.on('chat message', data => {
            fetch(`${PREFIX}/user/check`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({user: data.to})
            }).then(raw => raw.json()).then(response => {
                if(response.success){
                    var c = this.state.messages;
                    c.push(data);
                    this.setState({ messages: c });
                    this.scrollToLastMessage();
                }
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
            messages[messages.length-1].scrollIntoView();
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
            socket.emit('chat message', data);
            this.setState({ messages: c, currentMessageContent: '', currentImageContent: '' }, () => {
                this.scrollToLastMessage();
            });
        });
    }

    onImageInputClick(){ document.getElementById("imageInput").click(); }
    onInputChange(event){ this.setState({ currentMessageContent: event.target.value }); }

    tipModalRef = ({openDialog}) => {
        this.showTipModal = openDialog;
    }
    onTipButtonClick = () => {
        this.showTipModal();
    }
    
    onTipSent(tip){
        var formData = new FormData();
        var content = tip.user+' sent $'+tip.amount+'*'+tip.message;
        formData.append('content', content);
        formData.append('type', 'tip');
        fetch(`${PREFIX}/message`, {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: formData
        }).then(raw => raw.json()).then(data => {
            var c = this.state.messages;
            c.push(data);
            socket.emit('chat message', data);
            this.setState({ messages: c }, () => {
                this.scrollToLastMessage();
            });
        })
    }

    render(){
        let messages = this.state.messages;
        return(
            <div id="parent">
                <TipModal ref={this.tipModalRef} from={"messages"} onSuccess={this.onTipSent.bind(this)}/>
                {/* <div onClick={() => flash("Hey there we logged in and its all working", 10000, "green")}>Click for hello</div> */}
                <Navigation location="message" headerContent={
                    (<div className="header-content">
                        <img className="header-profile-image" src={`${PREFIX}/content/users/pfp.jpg`}/>
                        <span className="fw-normal fs-4">Jossie.JPEG</span>
                    </div>)
                } headerActions={(
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={this.onTipButtonClick}>
                            <FaMoneyBillWave style={{marginRight: '2px', marginBottom: '2px'}} /> Send Tip
                        </button>
                    </div>
                )}/>
                <div className="messaging">
                    <div className="message-box">
                        {messages.map((message, index) => {
                            let style = (message.from == "jossiejpeg") ? "incoming" : "outgoing";
                            let msgColor = (message.from == "jossiejpeg")?"jossie-message":"";
                            let tipStyle = (message.type == "tip") ? "tip" : "";
                            let content;
                            if(message.type == "message"){
                                if(message.content) content = <span className={style+"-text-box"}>{message.content}</span>
                                else content = <img className={style+"-img-content"} src={`${PREFIX}/content/${message.imageContent}`}/>
                            } else if (message.type == "tip") {
                                var split = message.content.split('*');
                                var header = split[0];
                                var msgContent = split.splice(1, split.length);
                                content = <div className={style+"-text-box"}>
                                    <span className="message-tip-header">{header}</span> <br/>
                                    <span>{msgContent.toString()}</span>
                                </div>
                            }
                            return(
                                <div className={style+"-message message"} key={index}>
                                    <span className={style+"-user"}>{message.from}</span>
                                    <div className={style+"-message-content "+tipStyle+" "+msgColor}>
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
                                <button disabled={!(this.state.currentImageContent||this.state.currentMessageContent)} className="btn btn-primary" id="sendMessage" type="submit">Send</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}