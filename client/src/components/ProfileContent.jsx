import React from 'react';
import $ from 'jquery';
import css from '../styles/ProfilePictureEditor.css';
import { connect } from 'react-redux';
import actions from '../../redux/actions';
import { Link } from 'react-router';
import { calculateTime} from '../utils/helpers';

class ProfileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: 'none',
      first: false,
      second: false,
      third: false,
      messageDisplay: 'unset',
      formDisplay: 'none',
      currentChat: [],
      timeDisplay: 'none',
      title: '',
      description: ''
    };
    this.editProfileImage = this.editProfileImage.bind(this);
    this.edit = this.edit.bind(this);
    this.onUsernameClick = this.onUsernameClick.bind(this);
    this.onSendMessageClick = this.onSendMessageClick.bind(this);
    this.onChallengeTitleClick = this.onChallengeTitleClick.bind(this);
    this.onSendReply = this.onSendReply.bind(this);
    this.onChatClick = this.onChatClick.bind(this);
    this.editPost = this.editPost.bind(this);
    this.savePost = this.savePost.bind(this);
    this.deletePost = this.deletePost.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.taskButtons = this.taskButtons.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
  }

  componentDidMount () {
    const outer = this;
    $.get('/api/getLeaders').then(leaders => {
      outer.props.dispatch(actions.getLeaders(leaders.map(leader => parseInt(leader))));
      outer.followers();
    });
  }

  numFollowers () {
    if (this.props.user) {
      return this.props.user.map((userInfo, i) => {
        return <span key={i}>{userInfo.followers}</span>;
      });
    }
  }

  changeProfileView(view) {
    this.props.dispatch(actions.setProfileView(view));
  }

  followers() {
    if (this.props.user.length > 0) {
      const outer = this;
      $.get('/api/listFollowers', {username: this.props.user[0].username}).then(data => {
        outer.props.dispatch(actions.setFollowers(data));
      });
    }
  }

  onNotificationClick(i, notification) {
    console.log(this.state[i])
    if (this.state[i] === 'none' || !this.state[i]) {
      this.setState({
        [i]: 'unset'
      });
    } else {
      this.setState({
        [i]: 'none'
      });
    }
    let outer = this;

    if (notification.read === 0) {
      if (notification.comment) {
        $.ajax({
          url: '/api/comments/' + notification.id,
          type: 'PUT',
          success: function(data) {
            outer.props.dispatch(actions.readNotification(data));
          }
        });
      } else {
        $.ajax({
          url: '/api/response/' + notification.id,
          type: 'PUT',
          success: function(data) {
            outer.props.dispatch(actions.readNotification(data));
          }
        });
      }
    }
  }

  upVoteClick(id) {
    const outer = this;
    $.post('/api/upvote', {
      vote: 1,
      challenge_id: id
    }).then(()=> {
      $.get('/api/allChallenges/')
        .then((data)=> {
          if (outer.props.currentCategory === 'all') {
            data = data.reverse();
          } else if (outer.props.currentCategory === 'recent') {
            data.length < 6 ? data = data.reverse() : data = data.slice(-5).reverse();
          } else if (outer.props.currentCategory === 'popular') {
            data = data.sort((a, b) =>
            b.upvotes - a.upvotes
          );
          } else {
            data = data.filter(challenge =>
            challenge.category === outer.props.currentCategory
          );
          }
          outer.props.dispatch(actions.addChallenge(data));
        });
    });
  }

  followTheLeader(leaderId) {
    const outer = this;
    $.post('/api/follower', {
      leader_id: leaderId
    }).then(() => {
      $.get('/api/getLeaders').then(leaders => {
        outer.props.dispatch(actions.getLeaders(leaders.map(leader => parseInt(leader))));
        outer.followers();
      });
    });
  }

  unFollow(leaderId) {
    const outer = this;
    $.post('/api/unFollow', {
      leader_id: leaderId
    }).then(() => {
      $.get('/api/getLeaders').then(leaders => {
        outer.props.dispatch(actions.getLeaders(leaders.map(leader => parseInt(leader))));
        outer.followers();
      });
    });
  }

  addToFavorites(challengeId) {
    const outer = this;
    $.post('/api/favorite', {
      challenge_id: challengeId
    }).then(() => {
      $.get('/api/favorite').then( favorites => {
        outer.props.dispatch(actions.setFavorites(favorites));
      });
    });
  }

  removeFromFavorites(challengeId) {
    const outer = this;
    $.post('/api/unFavorite', {
      challenge_id: challengeId
    }).then(() => {
      $.get('/api/favorite').then(favorites => {
        outer.props.dispatch(actions.setFavorites(favorites));
      });
    });
  }

  editProfileImage (id) {
    let outer = this;
    var fd = new FormData(document.querySelector('#pic'));
    $.ajax({
      url: '/api/s3',
      type: 'POST',
      data: fd,
      processData: false,  // tell jQuery not to process the data
      contentType: false,   // tell jQuery not to set contentType
      success: function(resp) {
        $.ajax({
          url: '/api/profile',
          type: 'PUT',
          data: {
            scott: id,
            profilepic: resp
          },
          success: function(data) {
            console.log('successfully updated');
            outer.refs.video.value = '';
            outer.setState({
              display: 'none',
            });
            $.get('/api/profile').then(userData => {
              outer.props.dispatch(actions.addUser(userData));
            });
          }
        });
      }
    });
  }

  edit (id, field, place) {
    let outer = this;
    $.ajax({
      url: '/api/profile',
      type: 'PUT',
      data: {
        scott: id,
        [field]: outer.refs[field].value,
      },
      success: function() {
        $.get('/api/profile').then(userData => {
          outer.props.dispatch(actions.addUser(userData));
          outer.refs[field].value = '';
          outer.setState({[place]: !outer.state[place]});
        });
      }
    });
  }

  onUsernameClick(post) {
    let outer = this;
    window.sessionStorage.newUsername = post.username;
    window.sessionStorage.newUser_id = post.user_id;
    this.changeProfileView('all');
    $.get('/api/profile/' + window.sessionStorage.newUsername).done(user => {
      outer.props.dispatch(actions.addUser(user));
      $.get('/api/favorite', {username: window.sessionStorage.newUsername}).done(data => {
        outer.props.dispatch(actions.setFavorites(data));
      });
      $.get('/api/userChallenges', {
        user_id: window.sessionStorage.newUser_id
      }).done(challenges => {
        outer.props.dispatch(actions.getChallenges(challenges.reverse()));
      });
    });
  }

  onSendMessageClick(e) {
    e.preventDefault();
    let created_at = new Date().getTime();
    let outer = this;
    this.setState({
      messageDisplay: 'unset',
      formDisplay: 'none'
    });

    let createChatRoom = true;

    for (let i = 0; i < this.props.chats.length; i++) {
      let chat = this.props.chats[i];

      if (chat.toUsername === window.sessionStorage.newUsername && chat.fromUsername === window.sessionStorage.username) {
        createChatRoom = false;
        let message = {
          message: outer.refs.message.value,
          to_Username: window.sessionStorage.newUsername,
          from_Username: window.sessionStorage.username,
          created_at: created_at,
          read: 0,
          chat_id: chat.id
        };

        $.post('/api/messages/' + window.sessionStorage.newUsername, message).done(data => {
          $.ajax({
            url: '/api/unseenChat/' + chat.id,
            type: 'PUT',
            success: function(data) {
              console.log('new messages in chat', data);
              outer.props.dispatch(actions.seenChat(data));
            }
          });
          outer.refs.message.value = '';
        });
      }
    }


    if (createChatRoom) {
      console.log('chatroom created');
      let chat = {
        fromUsername: window.sessionStorage.username,
        toUsername: window.sessionStorage.newUsername,
        new: 1
      };
      $.post('/api/chats', chat).done(data => {
        console.log('chatroom', data);
        outer.props.dispatch(actions.createChat(data));
        let message = {
          message: outer.refs.message.value,
          to_Username: window.sessionStorage.newUsername,
          from_Username: window.sessionStorage.username,
          created_at: created_at,
          read: 0,
          chat_id: data[0].id
        };

        $.post('/api/messages/' + window.sessionStorage.newUsername, message).done(data => {
          outer.refs.message.value = '';
        });
      });
    }
  }

  onMessageClick(message) {
    let outer = this;
    console.log('on message click', message);
    window.sessionStorage.setItem('messageParentId', message.message_id);
    window.sessionStorage.setItem('messageToUserId', message.fromUser_id);
    console.log('message to Id', window.sessionStorage.messageToUserId);
    console.log('message parent_id', window.sessionStorage.messageParentId);
    if (!message.read) {
      $.ajax({
        url: '/api/message/' + message.message_id,
        type: 'PUT',
        success: function(data) {
          console.log('put message data', data);
          outer.props.dispatch(actions.readMessage(data));
        }
      });
    }
    if (this.state.timeDisplay === 'none') {
      this.setState({
        timeDisplay: 'unset'
      });
    } else {
      this.setState({
        timeDisplay: 'none'
      });
    }
  }

  onChallengeTitleClick(challenge, index) {
    if (challenge.parent_id === null) {
      window.sessionStorage.setItem('challengeId', challenge.id);
      window.sessionStorage.setItem('currentId', challenge.id);
      window.sessionStorage.setItem('challengeName', challenge.title);
    } else if (window.sessionStorage.challengeId === undefined) {
      window.sessionStorage.setItem('challengeId', challenge.parent_id);
      window.sessionStorage.setItem('currentId', challenge.id);
      window.sessionStorage.setItem('challengeName', challenge.title);
    } else {
      window.sessionStorage.challengeId = challenge.parent_id;
      window.sessionStorage.currentId = challenge.id;
      window.sessionStorage.challengeName = challenge.title;
    }
  }

  onSendReply(e) {
    e.preventDefault();
    let outer = this;
    let created_at = new Date().getTime();
    console.log('replying', this.state.currentChat[0].id);
    let reply = {
      message: this.refs.reply.value,
      from_Username: window.sessionStorage.username,
      to_Username: window.sessionStorage.toUsername,
      created_at: created_at,
      read: 0,
      chat_id: this.state.currentChat[0].id
    };
    $.post('/api/message/' + this.state.currentChat[0].id, reply).done(data => {
      console.log('message data', data);
      $.ajax({
        url: '/api/unseenChat/' + data[0].chat_id,
        type: 'PUT',
        success: function(data) {
          console.log('unseen chat', data);
          outer.props.dispatch(actions.seenChat(data));
        }
      });
      outer.props.dispatch(actions.addMessage(data));
      outer.refs.reply.value = '';
    });
  }

  onChatClick(chat) {
    let outer = this;
    let currentChatArray = this.state.currentChat;
    currentChatArray.push(chat);

    this.setState({
      currentChat: currentChatArray
    });
    console.log('current chat', this.state.currentChat[0]);
    if (this.state.currentChat[0].new) {

      $.ajax({
        url: '/api/chat/' + this.state.currentChat[0].id,
        type: 'PUT',
        success: function(data) {
          console.log('seen chat data', data);
          outer.props.dispatch(actions.seenChat(data));
        }
      });
    }

    $.get('/api/chatMessages/' + chat.id).done(data => {
      outer.props.dispatch(actions.getMessages(data.reverse()));
    });
  }

  savePost(e, post, index) {

    let outer = this;
    let url = '/api/challenge/';

    if (post.parent_id) {
      url = '/api/response/';
    }

    console.log('post', this.state.title, this.state.description )
    $.ajax({
      url: url + post.id,
      type: 'PUT',
      data: {
        title: this.state.title,
        description: this.state.description
      },
      success: function(data) {
        console.log("save edit data", data)
        outer.props.dispatch(actions.updatePost(data));
        outer.setState({
          title: '',
          description: '',
          [index]: 'none'
        });
      }
    });
  }

  deletePost(post) {
    let outer = this;
    let url = '/api/challenge/';

    if (post.parent_id) {
      url = '/api/response/';
    }

    $.ajax({
      url: url + post.id,
      type: 'DELETE',
      success: function(data) {
        outer.props.dispatch(actions.getChallenges(data));
      }
    });
  }

  editPost(index) {
    console.log("edit post", index)
    if (this.state[index] === 'none' || !this.state[index]) {
      this.setState({
        [index]: 'unset'
      });
    } else {
      this.setState({
        [index]: 'none'
      });
    }
  }

  cancelEdit(e, index) {
    e.preventDefault();
    if (this.state[index] === 'none' || !this.state[index]) {
      this.setState({
        [index]: 'unset'
      });
    } else {
      this.setState({
        [index]: 'none'
      });
    }
  }

  handleTitleChange(e) {
    console.log(e.target.value)
    this.setState({
      title: e.target.value
    });
  }

  handleDescriptionChange(e) {
    this.setState({
      description: e.target.value
    });
  }

  taskButtons(post, index) {
    return (
      <div className="task-buttons">
        <div >
          <button className="btn btn-default btn-sm edit" onClick={() => this.editPost(index)}>
            <span className="glyphicon glyphicon-edit"></span>
          </button>
          <button className="btn btn-default btn-sm delete" onClick={() => this.deletePost(post)}>
            <span className="glyphicon glyphicon-remove"></span>
          </button>
        </div>
        <div style={{display: this.state[index] || 'none'}}>
        <div className="editor">
          <form id="editform">
            <input type="text" placeholder="Edit title" name="title" value={this.state.title} onChange={this.handleTitleChange}/><br/>
            <input type="text" placeholder="Edit description" name="description" value={this.state.description} onChange={this.handleDescriptionChange}/>
            <button type="button" className="btn btn-large btn-default edit" onClick={(e) => this.savePost(e, post, index)}>Save</button>
            <button className="btn btn-large btn-default delete" onClick={(e) => this.cancelEdit(e, index)}>Cancel</button>
          </form>
          </div>
        </div>
      </div>
    );
  }

  render() {
    let checkFile = (type, challenge) => {
      const fileType = {
        'mp4': 'THIS IS A VIDEO!'
      };
      if (fileType[type]) {
        return (<video className='parent-media' controls>
          {/*<source src={'https://s3-us-west-1.amazonaws.com/thegauntletbucket420/' + response.filename} type="video/mp4"/>*/}
        </video>);
      } else {
        return <img className='parent-media' src='http://coolwildlife.com/wp-content/uploads/galleries/post-3004/Fox%20Picture%20003.jpg'/>;
      }
    };


    let mappedChallenges = this.props.challenges.map((challenge, j) => {
      if (challenge) {
        if (challenge.username === this.props.user[0].username) {
          return (
            <div className="col-md-3 col-md-offset-2 text-center one-challenge" key={j}>
            <div className="row profile-edit-buttons">
              <span className='pull-right'>{this.taskButtons(challenge, j)}</span>
            </div>
            <div className="row challenge-title-row text-center">
              <p className='challenge-inprofile' onClick={() => this.onChallengeTitleClick(challenge, j)} className="category-title"><Link to={'/challenge'}>{challenge.title}</Link></p>
            </div>
            <div className="row challenge-media-row">
              {checkFile(challenge.filename.split('.').pop(), challenge)}<br/>
            </div>
            <div className="row category-row">
              <span className="category-tab">{challenge.category}</span>
            </div>
            <div className="row challenge-buttons pagination-centered">
            </div>
            <div className="row username-time">
              <Link onClick={() => this.onUsernameClick(challenge)}><span>{challenge.username + ' '}</span></Link>
              <h5>{challenge.description}</h5>
            </div>
          </div>
          );
        }
      } else {
        return ' No challenges submitted yet';
      }
    });

    let mappedResponses = this.props.responses.map((response, r) => {
      if (response) {
        if (response.username === this.props.user[0].username) {
          return (
            <div className="col-md-3 col-md-offset-2 text-center one-challenge" key={j}>
             <div className="row profile-edit-buttons">
              <span className='pull-right'>{this.taskButtons(response, j)}</span>
            </div>
            <div className="row challenge-title-row">
              <p className='challenge-inprofile' onClick={() => this.onChallengeTitleClick(response, j)} className="category-title"><Link to={'/challenge'}>{response.title}</Link></p>
            </div>
            <div className="row challenge-media-row">
              {checkFile(response.filename.split('.').pop(), response)}<br/>
            </div>
            <div className="row category-row">
              <span className="category-tab">{response.category}</span>
            </div>
            <div className="row challenge-buttons pagination-centered">
            </div>
            <div className="row username-time">
              <Link onClick={() => this.onUsernameClick(response)}><span>{response.username + ' '}</span></Link>
              <h5>{response.description}</h5>
            </div>
          </div>
          );
        }
      } else {
        return ' No responses submitted yet';
      }
    });

    let favoritedChallenges = this.props.favorites.map((challenge, i) => {
      if (challenge) {
        return (
          <div>
            <h4>{challenge.title}</h4>
            <p>{challenge.description}</p>
            {checkFile(challenge.filename.split('.').pop(), challenge)}
            <Link onClick={() => this.onUsernameClick(challenge)}>{challenge.username + ' '}</Link>
          </div>
        );
      }
    });

    let whichFollowButton = (leaderId, user) => {
      if (window.sessionStorage.username !== user) {
        if (this.props.leaders.includes(leaderId)) {
          return (
            <button className="btn btn-default btn-sm pull-right follower"onClick={() => this.unFollow(leaderId)}>
              <span className="glyphicon glyphicon-ok"></span>{'  Unfollow'}
            </button>
          );
        } else {
          return (
            <button className="btn btn-default btn-sm pull-right follower" onClick={() => this.followTheLeader(leaderId)}>
              <span className="glyphicon glyphicon-ok"></span>{'  Follow'}
            </button>
          );
        }
      }
    };

    let whichFavoriteIcon = (challengeId) => {
      if (this.props.favorites.some(challenge => challenge.id === challengeId)) {
        return (
          <button className="btn btn-default btn-sm pull-right">
            <span className="glyphicon glyphicon-heart" style={{color: 'red'}} onClick={() => { this.removeFromFavorites(challengeId); }}></span>
          </button>
        );
      } else {
        return (
          <button className="btn btn-default btn-sm pull-right" onClick={() => { this.addToFavorites(challengeId); }}>
            <span className="glyphicon glyphicon-heart"></span>
          </button>
        );
      }
    };

    let myView = () => {
      if (this.props.profileView === 'all' && window.sessionStorage.username === this.props.user[0].username) {
        return (
            <div>
              {mappedChallenges}
            </div>
        );
      } else if (this.props.profileView === 'responses' && window.sessionStorage.username === this.props.user[0].username) {
        return (
          <div>
            {mappedResponses}
          </div>
        );
      } else if (this.props.profileView === 'all') {
        return (
          <div>
            {this.props.user[0].username + '\'s challenges:'}
            {mappedChallenges}
          </div>
        );
      } else if (this.props.profileView === 'responses') {
        return (
          <div>
            {this.props.user[0].username + '\'s responses:'}
            {mappedResponses}
          </div>
        );
      } else if (this.props.profileView === 'favorites') {
        return (
          <div>
            Favorites:
            {favoritedChallenges}
          </div>
        );
      } else if (this.props.profileView === 'followers') {
        return (
          <div>
            Followers:
            {this.props.followers.map((follower, i) => {
              return <div key={i}>{i + 1}.{follower.username}</div>;
            })}
          </div>
        );
      } else if (this.props.profileView === 'notifications') {

        let notifications = this.props.responses.concat(this.props.comments);

        notifications.sort((a, b) => {
          return a.created_at < b.created_at;
        });

        let mappedNotifications = notifications.map((notification, i) => {
          let timeDifferenceInSeconds = (new Date().getTime() - parseInt(notification.created_at)) / 1000;
          if (notification.comment) {
            if (notification.read === 0) {
              return (
                <div>
                  <a href='javascript: void(0)' onClick={() => this.onNotificationClick(i, notification)}><h4>{notification.username + ' UNREAD commented to your challenge: ' + notification.title}</h4></a>
                  <h6>{calculateTime(timeDifferenceInSeconds)}</h6>
                  <div style={{display: this.state[i] || 'none'}}>
                    <Link onClick={() => this.onUsernameClick(notification)}>{notification.username + ' '}</Link><br/>
                    {notification.comment}
                  </div>
                </div>
              );
            } else {
              return (
                <div>
                  <a href='javascript: void(0)' onClick={() => this.onNotificationClick(i, notification)}><h4>{notification.username + ' commented to your challenge: ' + notification.title}</h4></a>
                  <h6>{calculateTime(timeDifferenceInSeconds)}</h6>
                  <div style={{display: this.state[i] || 'none'}}>
                    <Link onClick={() => this.onUsernameClick(notification)}>{notification.username + ' '}</Link><br/>
                    {notification.comment}
                  </div>
                </div>
              );
            }
          } else if (notification.parent_id) {
            if (notification.read === 0) {
              return (
                <div>
                  <a href='javascript: void(0)' onClick={() => this.onNotificationClick(i, notification)}><h4>{notification.username + ' UNREAD responded to your challenge...'}</h4></a>
                  {calculateTime(timeDifferenceInSeconds)}<br/>
                  <div style={{display: this.state[i] || 'none'}}>
                    {checkFile(notification.filename.split('.').pop(), notification.filename)}<br/>
                    <h4>{notification.title}</h4>
                    <h5>{notification.description}</h5>
                    <Link onClick={() => this.onUsernameClick(notification)}>{notification.username + ' '}</Link>
                    {whichFollowButton(notification.user_id, notification.username)}
                    {whichFavoriteIcon(notification.user_id)}
                    <a onClick={()=> this.upVoteClick(notification.id)}>{'Upvote'}</a><p>{`${notification.upvotes}`}</p>
                  </div>
                </div>
              );
            } else {
              return (
                <div>
                  <a href='javascript: void(0)' onClick={() => this.onNotificationClick(i, notification)}><h4>{notification.username + ' responded to your challenge...'}</h4></a>
                  {calculateTime(timeDifferenceInSeconds)}<br/>
                  <div style={{display: this.state[i] || 'none'}}>
                    {checkFile(notification.filename.split('.').pop(), notification.filename)}<br/>
                    <h4>{notification.title}</h4>
                    <h5>{notification.description}</h5>
                    <Link onClick={() => this.onUsernameClick(notification)}>{notification.username + ' '}</Link>
                    {whichFollowButton(notification.user_id, notification.username)}
                    {whichFavoriteIcon(notification.user_id)}
                    <a onClick={()=> this.upVoteClick(notification.id)}>{'Upvote'}</a><p>{`${notification.upvotes}`}</p>
                  </div>
                </div>
              );
            }
          }
        });

        return mappedNotifications;
      } else if (this.props.profileView === 'chats' && window.sessionStorage.username === this.props.user[0].username) {
        let chatName = '';
        if (this.state.currentChat.length === 0) {
          let mappedChats = this.props.chats.map((chat, i) => {
            if (chat.fromUsername === window.sessionStorage.username) {
              chatName = chat.toUsername;
            } else {
              chatName = chat.fromUsername;
            }

            if (chat) {
              return (
         // {       <div className="col-lg-4" style={{'margin-top': '50px'}}>
         //                   <div className="chat-picContainer" onClick={() => this.onChatClick(chat)}>
         // //                     <img className='profilePicture text' src={'https://s3-us-west-1.amazonaws.com/thegauntletbucket421/' + chat.profilepic}/>
         // //                     <div className='chat-username'>{chatName}</div>
         //                   </div>
         //                 </div>}

            <div className="col-lg-6">
                  <div className="profile-header-container" onClick={() => this.onChatClick(chat)}>
                  <div className="profile-header-img">
                          <img className="img-circle" src='http://www.thewrap.com/wp-content/uploads/2015/11/Donald-Trump.jpg'/>

                          <div className="rank-label-container">
                              <span className="label label-default rank-label">{chatName}</span>
                          </div>
                      </div>
                  </div>
            </div>

              );
            } else {
              return 'No chats';
            }
          });

          return mappedChats;
        } else {

          if (this.state.currentChat[0].fromUsername === window.sessionStorage.username) {
            window.sessionStorage.toUsername = this.state.currentChat[0].fromUsername;
          } else {
            window.sessionStorage.toUsername = this.state.currentChat[0].toUsername;
          }

          let mappedMessages = this.props.messages.map((message, i) => {
            let timeDifferenceInSeconds = (new Date().getTime() - parseInt(message.created_at)) / 1000;
            return (
              <div>
                <div onClick={() => this.onMessageClick(message)}>
                  <span className='messageUsername'>
                    {message.from_Username + ': ' + message.message}
                  </span>
                  <span style={{display: this.state.timeDisplay}}>
                    {calculateTime(timeDifferenceInSeconds)}
                  </span>
                </div>
              </div>
            );
          });

          return (
            <div>
              <div className='back-chat'>
                <button onClick={() => this.setState({currentChat: []})}>Back to chats</button>
              </div>
              {mappedMessages.reverse()}
              <form onSubmit={this.onSendReply} style={{padding: '10px'}} >
                <textarea cols='40' rows='5' type="text" placeholder='Reply here' required ref='reply'/>
                <input type="submit" value="Send"/>
              </form>
            </div>
          );
        }
      }
    };

    let renderTab = (type, tag, label) => {
      if (this.props.profileView === type) {
        return <li className="active" onClick={() => this.changeProfileView(type)}><a data-toggle="tab" href={tag}>{label}</a></li>;
      } else {
        return <li onClick={() => this.changeProfileView(type)}><a data-toggle="tab" href={tag}>{label}</a></li>;
      }
    };

    let renderNotifications = () => {
      if (window.sessionStorage.username === this.props.user[0].username) {
        return renderTab('notifications', '#menu4', 'Notifications');
      }
    };

    let renderChats = () => {
      if (window.sessionStorage.username === this.props.user[0].username) {
        return renderTab('chats', '#menu5', 'Chats');
      }
    };

    let renderFollowers = () => {
      if (this.props.profileView === 'followers') {
        return <li className="active" onClick={() => this.changeProfileView('followers')}><a data-toggle="tab" href="#menu3">Followers</a></li>;
      } else {
        return <li onClick={() => this.changeProfileView('followers')}><a data-toggle="tab" href="#menu3">Followers</a></li>;
      }
    };

    let isUserProfile = (placement, user) => {
      if (window.sessionStorage.username === user) {
        return <span>{<a href='javascript: void(0)' onClick={() => this.setState({[placement]: !this.state[placement]})}><span className="glyphicon glyphicon-pencil"></span></a>}</span>;
      } else {
        return <div></div>;
      }
    };

    let isUserImageClickable = (user) => {
      return window.sessionStorage.username === user;
    };

    let editField = (name, id, user, field, place, label) => {
      if (!this.state[place]) {
        return (
          <div>
            {label}: {name} {isUserProfile(place, user)}
          </div>
        );
      } else {
        return (
          <div>
            <form>
              <input ref={field} type='text' placeholder={name}/> <button onClick={() => this.edit(id, field, place)}><span className="glyphicon glyphicon-ok"></span></button> <a href='javascript: void(0)' onClick={() => this.setState({[place]: !this.state[place]})}><span className="glyphicon glyphicon-pencil"></span></a>
            </form>
          </div>
        );
      }
    };

    let sendMessage = () => {
      if (window.sessionStorage.username !== window.sessionStorage.newUsername) {
        return (
          <div>
            <button style={{display: this.state.messageDisplay}} onClick={() => this.setState({
              messageDisplay: 'none',
              formDisplay: 'unset'
            })}>Send a message</button>
            <form style={{display: this.state.formDisplay}} onSubmit={this.onSendMessageClick}>
              <textarea type='text' cols='40' rows='5' placeholder='Enter your message' required ref='message'/>
              <input type='submit' value='Send'/>
            </form>
          </div>
        );
      } else {
        return <div></div>;
      }
    };

    let target;
    if (this.props.user.length > 0) {
      target = this.props.user[0].username;
    }

    if (target) {
      return (
        <div className="row overallContent">
          <div className='col-lg-3 profileContainer'>
            <div id='picContainer' className="row">
              {/*<img className='profilePicture text' src={'https://s3-us-west-1.amazonaws.com/thegauntletbucket421/' + this.props.user[0].profilepic} />*/}
              <img className='col-lg- 12 profilePic' src="http://totorosociety.com/wp-content/uploads/2015/03/totoro_by_joao_sembe-d3f4l4x.jpg" onClick={() =>{ if (isUserImageClickable(target)) { this.state.display === 'none' ? this.setState({display: 'unset'}) : this.setState({display: 'none'}); } }}/>
            </div>
            <span className='editPic' style={{display: this.state.display}}>
              <form id='pic'>
                <input type="file" placeholder="image" ref="video" name="video" onChange={()=> { this.editProfileImage(this.props.user[0].scott); }} />
              </form>
            </span>
            <div className="row profileInfo">
              <div className="col-lg-12">
              Username: {target} <br />
              {editField(this.props.user[0].firstname, this.props.user[0].scott, target, 'firstname', 'first', 'Firstname')}
              {editField(this.props.user[0].lastname, this.props.user[0].scott, target, 'lastname', 'second', 'Lastname')}
              {editField(this.props.user[0].email, this.props.user[0].scott, target, 'email', 'third', 'Email')}
              Rank# {this.props.ranks.map((rank, index) => {
                return {username: rank.username, rank: index + 1};
              }).filter((user)=>{ if (user.username === target) { return user; } })[0].rank} (
                {this.props.user[0].upvotes}) <br />
              Followers: {this.props.followers.length} {whichFollowButton(this.props.user[0].scott, target)} <br />
              {sendMessage()}
              </div>
            </div>
          </div><br/>
          <div className="col-lg-8">
            <ul className="nav nav-tabs">
              {renderTab('all', '#home', 'Challenges')}
              {renderTab('responses', '#menu1', 'Responses')}
              {renderTab('favorites', '#menu2', 'Favorites')}
              {renderTab('followers', '#menu3', 'Followers')}
              {renderNotifications()}
              {renderChats()}
            </ul>
            {myView()}
          </div>
        </div>
      );
    } else {
      return <div></div>;
    }
  }
}

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(ProfileContent);
