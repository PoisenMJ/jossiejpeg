import React from 'react';
import { route_prefix } from '../../utility';
import Navigation from './Navigation';
import { Carousel, CloseButton, Form } from 'react-bootstrap';

export default class Gallery extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            posts: [],
            showModal: false,
            selectedContent: ''
        }
        fetch(`${route_prefix}/posts`).then(raw => raw.json()).then(data => {
            this.setState({ posts: data.posts });
        });
        this.selectPost = this.selectPost.bind(this);
        this.filterPosts = this.filterPosts.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
    }
    
    handleModalClose(){ this.setState({ showModal: false }); }
    selectPost(post){ this.setState({ selectedContent: post, showModal: true }); }
    filterPosts(event){
        if(event.target.value == "date-earliest"){
            var posts = this.state.posts;
            posts.sort((a, b) => {
                var dateA = new Date(a.datePosted);
                var dateB = new Date(b.datePosted);
                return dateA - dateB;
            });
            this.setState({ posts });
        }
        else if(event.target.value == "date-latest"){
            var posts = this.state.posts;
            for(let post in posts){
                console.log(new Date(posts[post].datePosted));
            }
            posts.sort((a, b) => {
                var dateA = new Date(a.datePosted);
                var dateB = new Date(b.datePosted);
                return dateB - dateA;
            });
            for(let post in posts){
                console.log(posts[post]);
            }
            this.setState({ posts });
        }
    }

    render(){
        return(
            <div id="parent">
                <Navigation location="gallery" headerContent={(
                    <div id="gallery-header">
                        <img id="gallery-header-image" src={`${route_prefix}/content/users/pfp.jpg`}/>
                        <span className="gallery-header-name">Jossi.JPEG</span>
                    </div>
                )}/>
                {this.state.showModal && 
                    <div id="gallery-modal">
                        <CloseButton 
                            style={{position: "fixed", top: "10px", right: "10px"}}
                            onClick={this.handleModalClose}/>
                        <div id="gallery-modal-images">
                            <Carousel dark>
                                {this.state.selectedContent && this.state.selectedContent.map((content, index) => {
                                    return(
                                        <Carousel.Item>
                                            <img className="gallery-modal-image" src={`${route_prefix}/content/${content}`}/>
                                        </Carousel.Item>
                                    )
                                })}
                            </Carousel>
                        </div>
                    </div>
                }
                <div id="gallery-filter">
                    <Form.Select onChange={this.filterPosts}>
                        <option>Filter By:</option>
                        <option value="date-earliest">Date (earliest)</option>
                        <option value="date-latest">Date (latest)</option>
                    </Form.Select>
                </div>
                <div className="gallery">
                    {this.state.posts && this.state.posts.map((post, index) => {
                        return(
                            <div key={post._id} className="gallery-post" onClick={() => this.selectPost(post.content)}>
                                <img className="gallery-post-image" src={`${route_prefix}/content/${post.content[0]}`}/>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}