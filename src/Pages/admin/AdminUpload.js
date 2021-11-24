import React from 'react';
import AdminNavigation from './AdminNavigation';
import data from "../../../config.json";
const PREFIX = (data.DEVELOPMENT) ? '/api' : '';

export default class AdminUpload extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            posts: [],
            uploadedImages: '',
            description: ''
        }

        fetch(`${PREFIX}/posts`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        }).then(raw => raw.json()).then(data => {
            // reverse array so that last ones come first
            this.setState({ posts: data.posts.reverse() });
        });
    }
    
    componentDidMount(){
        var imageInput = document.getElementById('content');
        imageInput.onchange = (event) => this.setState({ uploadedImages: imageInput.files });
    }

    descriptionUpdate(e){ this.setState({ description: e.target.value }); }
    imageUpdate(e){ this.setState({}) }

    uploadPost(event){
        event.preventDefault();
        var formData = new FormData(document.getElementById('uploadForm'));
        fetch(`${PREFIX}/admin/upload`, {
            method: "POST",
            // headers: { "Content-Type": "multipart/form-data" },
            body: formData
        }).then(raw => raw.json()).then(data => {
            var c = this.state.posts;
            c.push(data);
            this.setState({ posts: c });
        })
    }

    removePost(id){
        fetch(`${PREFIX}/admin/removePost`, {
            method: "POST",
            body: JSON.stringify({id: id}),
            headers: { "Content-Type": "application/json" }
        }).then(raw => raw.json()).then(data => {
            var c = this.state.posts;
            c = c.filter(e => e._id !== id);
            this.setState({ posts: c });
        })
    }

    render(){
        let posts = this.state.posts;
        return (
            <div id="parent">
                <AdminNavigation location="upload"/>
                <div id="upload">
                    <div id="uploadHeader">
                        <legend>Create Post</legend>
                        <form id="uploadForm" method="post" onSubmit={this.uploadPost.bind(this)}>
                            <div className="mb-3">
                                <input className="form-control" type="file" id="content" name="content" multiple="multiple" />
                            </div>
                            <div className="input-group mb-3">
                                <textarea onChange={this.descriptionUpdate.bind(this)} className="form-control" placeholder="description..." name="description"></textarea>
                            </div>
                            <button className="btn btn-primary btn-block w-100" type="submit">Post</button>
                        </form>
                    </div>
                    <div className="upload-posts">
                        {posts.map((post, index) => {
                            return (
                                <div className="upload-post" key={index}>
                                    <div className="upload-post-content bg-primary">
                                        <img className="upload-post-image" src={`${PREFIX}/content/${post.content[0]}`} />
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
            </div>
        )
    }
}