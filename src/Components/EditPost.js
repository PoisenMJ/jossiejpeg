import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { route_prefix } from '../../utility';
import {flash} from 'react-universal-flash';

export default class EditPost extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            description: props.post.description,
            restrictComments: props.post.restrictedComments
        }
        this.removePost = this.removePost.bind(this);
        this.updatePost = this.updatePost.bind(this);

        this.descriptionChange = this.descriptionChange.bind(this);
        this.restrictCommentsChange = this.restrictCommentsChange.bind(this);
    }

    updatePost(){
        var formData = new FormData();
        if(this.state.description != null || this.state.restrictComments != null){
            if(this.state.description != null) formData.append('description', this.state.description);
            if(this.state.restrictComments != null) formData.append('restrictComments', this.state.restrictComments);
            formData.append('id', this.props.post._id);
            fetch(`${route_prefix}/admin/update-post`, {
                method: "POST",
                body: formData
            }).then(data => {
                flash("Updated", 10000, "green");
            })
        }
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

    descriptionChange(event){
        this.setState({ description: event.target.value });
    }
    restrictCommentsChange(event){
        var value = (this.state.restrictComments != null) ? !this.state.restrictComments : !this.props.post.restrictedComments;
        this.setState({ restrictComments: value });
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
        var checked = (this.state.restrictComments != null)?this.state.restrictComments:post.restrictedComments;
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
                        <Form.Control className="mb-2" as="textarea" name="description" onChange={this.descriptionChange} value={(this.state.description != null)?this.state.description:post.description}/>
                        <Form.Check checked={checked} type="checkbox" name="restrictComments" label="Restrict Comments" onChange={this.restrictCommentsChange}/>
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