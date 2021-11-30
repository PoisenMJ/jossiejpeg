import React from 'react';
import Navigation from './Navigation';
import route_prefix from '../../utility';
import { FaMoneyBillWave, FaHeart, FaRegHeart } from 'react-icons/fa';
import TipModal from '../Components/TipModal';
import MessageFlash from '../Components/MessageFlash';
import Post from '../Components/Post';

export default class Home extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            posts: []
        }

        fetch(`${route_prefix}/posts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(raw => raw.json()).then(data => {
            console.log(data);
            this.setState({ posts: data.posts });
        });
    }
    messageFlashRef = ({showMessage}) => {this.showFlashMessage = showMessage; }
    onShowAlertButtonClick = () => { this.showFlashMessage(); }

    tipModalRef = ({openDialog}) => { this.showTipModal = openDialog; }
    onTipButtonClick = () => { this.showTipModal(); }
    onTipSent(){

    }

    render(){
        let posts = this.state.posts;
        return(
            <div id="parent">
                <TipModal ref={this.tipModalRef} from="posts" onSuccess={this.onTipSent.bind(this)}/>
                <MessageFlash ref={this.messageFlashRef} time={60} variant="success" message="hello"/>
                <Navigation location="home"/>
                {/* <button onClick={this.onShowAlertButtonClick}>alert</button> */}
                <div className="posts">
                    {posts.map((post, index) => {
                        return(
                        <Post key={index}
                            index={index}
                            images={post.content}
                            datePosted={post.datePosted}
                            description={post.description}
                            tipClickCallback={this.onTipButtonClick}
                            postId={post._id}
                            likes={post.likes.length}
                            liked={post.liked}
                            comments={post.comments}
                            restrictedComments={post.restrictedComments}/>
                        )
                    })}
                </div>
            </div>
        )
    }
}