import React from 'react';
import { connect } from 'react-redux';
import css from '../styles/comments.css';
import $ from 'jquery';
import actions from '../../redux/actions';
import CommentComponent from './CommentComponent.jsx';

class CommentList extends React.Component {
  constructor(props) {
    super(props);
    this.commentSubmit = this.commentSubmit.bind(this);
  }

  commentSubmit(e) {
    e.preventDefault();
    let outer = this;
    let created_at = new Date().getTime();
    let comments = {
      comment: this.refs.comment.value,
      challenge_id: window.sessionStorage.id,
      created_at: created_at,
      username: window.sessionStorage.getItem('key')
    };
    $.post('/api/comments', comments).then(data => {
      outer.props.dispatch(actions.addComment(data));
      outer.refs.comment.value = '';
    });
  }

  render() {
    let mappedComments = this.props.comments.map((comment, i) => {
      console.log('comment list map comment', comment)
      return (
        <div>
          <CommentComponent comment={comment}/>
        </div>
      );
    });

    return (
      <div className='comment-box'>
        <form onSubmit={this.commentSubmit}>
          <textarea name="comment" required ref="comment" placeholder="Enter comment..."></textarea>
          <input type="submit" className="btn btn-default btn-xs"/>
        </form>
        <div id="comments">{mappedComments}</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(CommentList);