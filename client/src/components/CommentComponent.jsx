import React from 'react';
import { Link } from 'react-router';
import css from '../styles/commentComponent.css';
import actions from '../../redux/actions';
import { connect } from 'react-redux';

class CommentComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onUsernameClick = this.onUsernameClick.bind(this);
  }

  onUsernameClick(comment) {
    let outer = this;
    $.get('/api/profile/' + comment.username).done(user => {
      outer.props.dispatch(actions.addUser(user));
      window.sessionStorage.username = comment.username;
      window.location.href = '/#/profile/' + comment.username;
    });
  }

  render() {
    let calculateTime = (seconds) => {
      if (seconds < 60) {
        return Math.floor(seconds) + ' seconds ago';
      } else if (seconds >= 60 && seconds < 3600) {
        if (seconds < 120) {
          return ' 1 minute ago';
        } else {
          return Math.floor(seconds / 60) + ' minutes ago';
        }
      } else if (seconds >= 3600 && seconds < 86400) {
        if (seconds < 7200) {
          return ' 1 hour ago';
        } else {
          return Math.floor(seconds / 3600) + ' hours ago';
        }
      } else if (seconds >= 86400 && seconds < 604800) {
        if (seconds < 172800) {
          return ' 1 day ago';
        } else {
          return Math.floor(seconds / 86400) + ' days ago';
        }
      } else if (seconds >= 2592000 && seconds < 31104000) {
        if (seconds < 5184000) {
          return ' 1 month ago';
        } else {
          return Math.floor(seconds / 2592000) + ' months ago';
        }
      } else {
        if (seconds < 62208000) {
          return ' 1 year ago';
        } else {
          return Math.floor(seconds / 31104000) + ' years ago';
        }
      }
    };

    let timeDifferenceInSeconds = (new Date().getTime() - parseInt(this.props.comment.created_at)) / 1000;

    return (
      <div>
        <h4 className="username"><Link onClick={() => this.onUsernameClick(this.props.comment)}className="userLink">{this.props.comment.username + ' '}</Link></h4><span className='timestamp'>{calculateTime(timeDifferenceInSeconds)}</span><br/>{this.props.comment.comment}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return state;
}

export default connect(mapStateToProps)(CommentComponent);