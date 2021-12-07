import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import route_prefix from '../../utility';

export default class NewPost extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            description: '',
            content: [],
            restrictComments: false
        }
        this.createPost = this.createPost.bind(this);
    }

    createPost(){
        fetch(`${route_prefix}/admin/upload`, {
            method: "POST",
            body: new FormData(document.getElementById("newPostForm"))
        }).then(c => c.json()).then(data => {
            console.log(data);
            this.props.handleClose();
            this.props.onPostCreated(data);
        })
    }

    render(){
        return(
            <Modal show={this.props.show} onHide={this.props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id="newPostForm">
                        <Form.Group className="mb-3">
                            <Form.Control as="textarea" name="description" placeholder="description"/>
                            <Form.Control className="mt-2 mb-2" type="file" id="postFiles" name="postFiles" multiple/>
                            <Form.Select aria-label="restricted comments">
                                <option default value="false">Don't Restrict Comments</option>
                                <option value="true">Restrict Comments</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={this.createPost}>Create</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}