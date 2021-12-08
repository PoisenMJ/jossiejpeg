import React from 'react';
import ROUTE_PREFIX from '../../utility';

export default class CommentsBox extends React.Component {
    render(){
        let content = (this.props.comments) ? this.props.comments.map((comment, index) => {
            return (
                <div className="comment-parent">
                    <img className="comment-user-image" src={`${ROUTE_PREFIX}/content/users/${comment.image}`}/>
                    <div className="comment-content">
                        <span className="comment-content-user-name">{comment.user}</span>
                        <span className="comment-content-message">{comment.content}</span>
                    </div>
                </div>
            )
        }) : '';
        return(
            <div className="comments-box">
                {content}
            </div>
        )
    }
}