import React from 'react';
import AdminNavigation from './AdminNavigation';
import { route_prefix } from '../../../utility';
import { useMediaQuery } from 'react-responsive';
import NewPost from '../../Components/NewPost';
import { Spinner, Button } from 'react-bootstrap';
import { FaRegEdit } from 'react-icons/fa';
import EditPost from '../../Components/EditPost';

const useMobileQuery = () => useMediaQuery({ query: '(max-width: 768px)' })
const Mobile = ({ children }) => {
    return useMobileQuery() ? children : null;
}
const useDesktopQuery = () => useMediaQuery({ query: '(min-width: 769px)' })
const Desktop = ({ children }) => {
    return useDesktopQuery() ? children : null;
}

export default class AdminUpload extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            posts: [],
            uploadedImages: '',
            description: '',
            showNewPostModal: false,
            showEditPostModal: false,
            postToEdit: '',
            postsLoading: true
        }

        fetch(`${route_prefix}/posts`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }).then(raw => raw.json()).then(data => {
            // reverse array so that last ones come first
            this.setState({ posts: data.posts.reverse(), postsLoading: false });
        });

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.clickEditPost = this.clickEditPost.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this);
        this.postCreated = this.postCreated.bind(this);
        this.postDeleted = this.postDeleted.bind(this);
    }
    
    componentDidMount(){
        var imageInput = document.getElementById('content');
        if(imageInput) imageInput.onchange = (event) => this.setState({ uploadedImages: imageInput.files });
    }

    uploadPost(event){
        event.preventDefault();
        var formData = new FormData(document.getElementById('uploadForm'));
        fetch(`${route_prefix}/admin/upload`, {
            method: "POST",
            // headers: { "Content-Type": "multipart/form-data" },
            body: formData
        }).then(raw => raw.json()).then(data => {
            var c = this.state.posts;
            c.splice(0, 0, data);
            this.setState({ posts: c });
        })
    }

    clickEditPost(post){
        this.setState({ postToEdit: post, showEditPostModal: true });
    }

    removePost(id){
        fetch(`${route_prefix}/admin/remove-post`, {
            method: "POST",
            body: JSON.stringify({id: id}),
            headers: { "Content-Type": "application/json" }
        }).then(raw => raw.json()).then(data => {
            var c = this.state.posts;
            c = c.filter(e => e._id !== id);
            this.setState({ posts: c });
        })
    }

    openModal(){ this.setState({ showNewPostModal: true }); }
    closeModal(){ this.setState({ showNewPostModal: false }) }
    closeEditModal(){
        fetch(`${route_prefix}/posts`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }).then(raw => raw.json()).then(data => {
            // reverse array so that last ones come first
            this.setState({ posts: data.posts.reverse(), postsLoading: false });
        });
        this.setState({ showEditPostModal: false  });
    }

    postCreated(post){
        var posts = this.state.posts;
        posts.push(post);
        this.setState({ posts: posts });
    }
    postDeleted(post){
        var posts = this.state.posts;
        var index = posts.indexOf(post);
        posts.splice(index, 1);
        this.setState({ posts: posts });
    }

    render(){
        let posts = this.state.posts;
        let loading = this.state.postsLoading;
        return (
            <div id="parent">
                <Desktop>
                    <AdminNavigation location="upload"/>
                    <div id="upload">
                        <div id="uploadHeader">
                            <legend>Create Post</legend>
                            <form id="uploadForm" method="post" onSubmit={this.uploadPost.bind(this)}>
                                <div className="mb-3">
                                    <input className="form-control" type="file" id="content" name="content" multiple="multiple" />
                                </div>
                                <div className="input-group mb-3">
                                    <textarea className="form-control" placeholder="description..." name="description"></textarea>
                                </div>
                                <button className="btn btn-primary btn-block w-100" type="submit">Post</button>
                            </form>
                        </div>
                        <div className="upload-posts">
                            {posts.map((post, index) => {
                                return (
                                    <div className="upload-post" key={index}>
                                        <div className="upload-post-content bg-primary">
                                            <img className="upload-post-image" src={`${route_prefix}/content/${post.content[0]}`} />
                                            <div className="upload-post-footer">
                                                <span className="upload-post-text">{post.description}</span>
                                                {/* <div className="upload-post-actions"> */}
                                                    <span className="upload-post-date-posted">{post.datePosted}</span>
                                                    <button onClick={this.removePost.bind(this, post._id)} type="button" className="btn btn-danger btn-block upload-post-remove-button" aria-label="remove">Remove</button>
                                                {/* </div> */}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </Desktop>

                <Mobile>
                    <AdminNavigation location="upload" headerActions={(
                        <button onClick={this.openModal} className="btn btn-success">Create +</button>
                    )}/>
                    <NewPost show={this.state.showNewPostModal} handleClose={this.closeModal} onPostCreated={this.postCreated}/>
                    <EditPost show={this.state.showEditPostModal} post={this.state.postToEdit} handleClose={this.closeEditModal} onPostRemoved={this.postDeleted}/>
                    <div id="upload-mobile">
                        {this.state.posts.map((post, index) => {
                            if(!loading){
                                var datePosted = new Date(post.datePosted);
                                return(
                                    <div className="post-mobile" key={index}>
                                        {post.content.length > 0 &&
                                            <img className="post-mobile-img" src={`${route_prefix}/content/${post.content[0]}`}/>
                                        }
                                        <span className="post-mobile-description">{post.description}</span>
                                        <span className="post-mobile-date-posted">{datePosted.getDate()+"/"+datePosted.getMonth()+"/"+datePosted.getFullYear()}</span>
                                        <Button className="post-mobile-date-edit" onClick={() => this.clickEditPost(post)} variant="dark"><FaRegEdit style={{marginLeft: '2px', marginBottom: '4px'}}/></Button>
                                    </div>
                                )
                            }
                        })}
                        {this.state.posts.length == 0 && !loading &&
                            <div id="upload-mobile-no-posts">
                                <div>
                                    <span className="lead text-center d-block fs-2">No Posts</span>
                                    <span className="fs-5 text-center">
                                        Click <span className="text-success fw-bold">Create +</span> to create post
                                    </span>
                                </div>
                            </div>
                        }
                        {loading &&
                            <Spinner animation="border" variant="primary"/>
                        }
                    </div>
                </Mobile>
            </div>
        )
    }
}