import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import route_prefix from '../../utility';

export default class EditPost extends React.Component{
    constructor(props){
        super(props);
        this.removePost = this.removePost.bind(this);
    }

    updatePost(){
        fetch(`${route_prefix}/admin/update-post`, {
            method: "POST",
            body: new FormData(document.getElementById("editPostForm"))
        })
    }

    removePost(){
        fetch(`${route_prefix}/admin/remove-post`,{
            method: "POST",
            body: JSON.stringify({id: this.props.post._id}),
            headers: { "Content-Type": "application/json" }
        }).then(raw => raw.json()).then(data => {
            this.props.handleClose();
            this.props.onPostRemoved(this.props.post);
        })
    }

    render(){
        var post = this.props.post;
        var images = (post) ? (
            post.content.map((image, index) => {
                return(
                    <img key={index} className="edit-post-image" src={`${route_prefix}/content/${image}`}/>
                )
            })
        ) : '';
        
        return(
            <Modal show={this.props.show} onHide={this.props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id="editPostForm">
                        <div className="edit-post-images">
                            {images}
                        </div>
                        <Form.Control className="mb-2" as="textarea" name="description" defaultValue value={(post)?post.description:''}/>
                        <Form.Select>
                            <option default={!post.restrictComments} value="false">Don't Restrict Comments</option>
                            <option default={post.restrictComments} value="true">Restrict Comments</option>
                        </Form.Select>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={this.removePost}>Remove</Button>
                    <Button variant="success" onClick={this.updatePost}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}