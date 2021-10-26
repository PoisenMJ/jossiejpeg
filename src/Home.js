import React from 'react';
import Navigation from './Navigation';
import "./Home.css";
import data from './config.json';
const ROUTE_PREFIX = (data.DEVELOPMENT) ? '/api' : '';

export default class Home extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            posts: []
        }

        fetch(`${ROUTE_PREFIX}/posts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(raw => raw.json()).then(data => {
            console.log(data);
            this.setState({ posts: data.posts });
        });
    }

    render(){
        let posts = this.state.posts;
        return(
            <div id="parent">
                <Navigation location="home"/>
                <div className="posts">
                    {posts.map((post, index) => {
                        var content = (post.content.map((image, index) => {
                            if(index == 0){
                                return(
                                    <div key={index} className="carousel-item active">
                                        <img className="post-image" src={`${ROUTE_PREFIX}/content/${image}`}/>
                                    </div>
                                )
                            } else {
                                return(
                                    <div key={index} className="carousel-item">
                                        <img className="post-image" src={`${ROUTE_PREFIX}/content/${image}`}/>
                                    </div>
                                )
                            }
                        }));
                        var indicators = (post.content.map((i, index) => {
                            if(index == 0){
                                return(
                                    <button key={"indicator"+index} className="active" type="button" data-bs-target={"#postCarousel"+index} data-bs-slide-to={index} aria-current="true"/>
                                )
                            } else {
                                return(
                                    <button key={"indicator"+index} type="button" data-bs-target={"#postCarousel"+index} data-bs-slide-to={index}/>
                                )
                            }
                        }));
                        return(
                            <div key={post._id} className="post bg-primary">
                                <div className="post-header">
                                    <div className="post-user">
                                        <img className="post-user-image" src={`${ROUTE_PREFIX}/content/users/pfp.jpg`}/>
                                        <div className="post-user-details">
                                            <span className="post-user-name">Jossie</span>
                                            <span className="post-user-username text-muted">@jossiejpeg</span>
                                        </div>
                                    </div>
                                    <span className="text-muted post-date">{post.datePosted}</span>
                                </div>
                                <div className="post-description">{post.description}</div>
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
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}