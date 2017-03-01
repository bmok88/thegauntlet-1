import React from 'react';
import $ from 'jquery';
import css from '../styles/ProfilePictureEditor.css';
import { connect } from 'react-redux';
import actions from '../../redux/actions';
import ProfileContent from './ProfileContent.jsx';
import NavBar from './Nav.jsx';

class Profile extends React.Component {

  componentWillMount() {
    let outer = this;
    $.get('/api/response', {
      parent_id: window.sessionStorage.newUser_id
    }).done(data => {
      let responseArr = [];
      data.forEach(response => {
        if (response.parent_id) {
          responseArr.push(response);
        }
      });
      outer.props.dispatch(actions.getResponses(responseArr));
    });
    $.get('/api/comments', {
      user_id: window.sessionStorage.newUser_id
    }).done(data => {
      console.log('comment data', data);
      outer.props.dispatch(actions.getComments(data.reverse()));
    });
    $.get('/api/ranks').done((rankData)=>{
      outer.props.dispatch(actions.getRanks(rankData));
    });
    $.get('/api/userChallenges', {
      user_id: window.sessionStorage.newUser_id
    }).done(challenges => {
      outer.props.dispatch(actions.getChallenges(challenges.reverse()));
    });
    if (!outer.props.user) {
      $.get('/api/profile/' + window.sessionStorage.newUsername).done(user => {
        outer.props.dispatch(actions.addUser(user));
      });
    }
    if (outer.props.favorites.length === 0) {
      $.get('/api/favorite', {username: window.sessionStorage.newUsername}).done(data => {
        outer.props.dispatch(actions.setFavorites(data));
      });    
    }
  }

  render() {
    if (this.props.user) {
      return (
        <div className='container-fluid profile'>
          <NavBar auth={this.props.auth} handleLogout={this.props.handleLogout}/>
          <ProfileContent />
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

export default connect(mapStateToProps)(Profile);