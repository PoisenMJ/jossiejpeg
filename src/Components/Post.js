import React from "react";
import { route_prefix } from '../../utility';

import { FaMoneyBillWave, FaRegHeart, FaHeart, FaRegCommentAlt, FaArrowRight } from 'react-icons/fa';
import CommentsBox from "./CommentsBox";

export default class Post extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            liked: props.liked,
            likes: props.likes,
            comments: props.comments,
            comment: ''
        }
    }

    like(){
        this.setState({ liked: true });
        //send to server
        fetch(`${route_prefix}/home/like`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({postID: this.props.postId})
        }).then(raw => raw.json()).then(data => {
            if(data.success) this.setState({ likes: this.state.likes + 1 });
        })
    }

    unlike(){
        this.setState({ liked: false });
        fetch(`${route_prefix}/home/unlike`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({postID: this.props.postId})
        }).then(raw => raw.json()).then(data => {
            if(data.success) this.setState({ likes: this.state.likes - 1 });
        })
    }

    onCommentChange(event){
        this.setState({ comment: event.target.value });
    }

    comment(){
        fetch(`${route_prefix}/home/comment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                postID: this.props.postId,
                comment: this.state.comment
            })}).then(raw => raw.json()).then(data => {
                var c = this.state.comments;
                c.push(data);
                this.setState({ comments: c, comment: '' });
            })
    }

    render(){
        var liked = this.state.liked;
        var index = this.props.index;
        var images = this.props.images;
        var content = (images.map((image, index) => {
            if(index == 0){
                return(<div key={index} className="carousel-item active">
                        <img className="post-image" src={`${route_prefix}/content/${image}`}/>
                    </div>)
            } else {
                return(<div key={index} className="carousel-item">
                        <img className="post-image" src={`${route_prefix}/content/${image}`}/>
                    </div>)
            }
        }));
        var indicators = (images.map((i, index) => {
            if(index == 0){
                return(<button key={"indicator"+index} className="active" type="button" data-bs-target={"#postCarousel"+index} data-bs-slide-to={index} aria-current="true"/>)
            } else {
                return(<button key={"indicator"+index} type="button" data-bs-target={"#postCarousel"+index} data-bs-slide-to={index}/>)
            }
        }));
        return(
            <div className="post bg-primary">
                <div className="post-header">
                    <div className="post-user">
                        <img className="post-user-image" src={`${route_prefix}/content/users/pfp.jpg`}/>
                        <div className="post-user-details">
                            <span className="post-user-name">Jossie</span>
                            <span className="post-user-username text-muted">@jossiejpeg</span>
                        </div>
                    </div>
                    <span className="text-muted post-date">{this.props.datePosted}</span>
                    <div className="post-actions">
                        <button className="btn bg-white" onClick={this.props.tipClickCallback}><FaMoneyBillWave style={{marginBottom: '2px'}}/> Tip</button>
                    </div>
                </div>
                <div className="post-description">{this.props.description}</div>
                <div className="carousel carousel-dark slide" data-bs-ride="carousel" id={"postCarousel"+index}>
                    <div className="carousel-indicators">
                        {indicators}
                    </div>
                    <div className="carousel-inner">
                        <div className="carousel">
                            {content}
                        </div>
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target={"#postCarousel"+index} data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"/>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target={"#postCarousel"+index} data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
                <div className="post-footer">
                    <div className="mb-2">
                        {!liked ? <FaRegHeart style={{marginBottom: '3px', marginRight: '3px', cursor: 'pointer'}} onClick={this.like.bind(this)}/>
                        : <FaHeart style={{marginBottom: '3px', marginRight: '3px', cursor: 'pointer'}} onClick={this.unlike.bind(this)}/>}{this.state.likes}
                        <FaRegCommentAlt style={{marginBottom: '3px', marginRight: '3px', marginLeft: '6px', cursor: 'pointer'}}/>
                    </div>
                    <CommentsBox comments={this.state.comments}/>
                    {this.props.restrictedComments ? '' :
                        <div className="post-comments">
                            <div className="input-group mb-3">
                                <input type="text" value={this.state.comment} onChange={this.onCommentChange.bind(this)} className="form-control"></input>
                                <button className="btn btn-secondary" onClick={this.comment.bind(this)}><FaArrowRight/></button>
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }
}