import React from 'react';
import { connect } from 'react-redux';
import actions from '../../redux/actions.js';
import ChallengeComponent from './ChallengeComponent.jsx';
import $ from 'jquery';
import { Link } from 'react-router';

class ChallengeList extends React.Component {
  constructor(props) {
    super(props);

    this.onChallengeClick = this.onChallengeClick.bind(this);
    this.upVoteClick = this.upVoteClick.bind(this);
    this.followTheLeader = this.followTheLeader.bind(this);
    this.unFollow = this.unFollow.bind(this);
  }

  onChallengeClick(challenge) {
    window.sessionStorage.setItem('title', challenge.title);
    console.log('inside challenge click', challenge.id);
    window.sessionStorage.setItem('id', challenge.id);
    window.sessionStorage.setItem('description', challenge.description);
    window.sessionStorage.setItem('category', challenge.category);
    window.sessionStorage.setItem('filename', challenge.filename);
    window.sessionStorage.setItem('upvotes', challenge.upvotes);
    window.sessionStorage.setItem('views', challenge.views);
  }

  upVoteClick(id) {
    console.log('upvote fired for challenge', id);
    const outer = this;
    $.post('/api/upvote', {
      vote: 1,
      challenge_id: id
    }).then(()=> {
      $.get('/api/allChallenges/')
        .then((data)=> {
          data = data.reverse();
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
      });
    });
  }

  unFollow (leaderId) {
    const outer = this;
    $.post('/api/unFollow', {
      leader_id: leaderId
    }).then(() => {
      $.get('/api/getLeaders').then(leaders => {
        outer.props.dispatch(actions.getLeaders(leaders.map(leader => parseInt(leader))));
      });
    });
  }

  render() {
    let checkFile = (type, challenge) => {
      const fileType = {
        'mp4': 'THIS IS A VIDEO!'
      };
      if (fileType[type]) {
        return (
          <div>
            <video width="320" height="240" controls className="center-block">
            {/*<source src={'https://s3-us-west-1.amazonaws.com/thegauntletbucket421/' + challenge.filename} type="video/mp4"/>*/}
            </video>
          </div>
        );
      } else {
        // return <img src={'https://s3-us-west-1.amazonaws.com/thegauntletbucket421/' + challenge.filename} width="320" height="240" />;
        return (
          <div>
            <img width="320" height="240" className="center-block"/>
          </div>  
        );
      }
    };

    let whichButton = (leaderId) => {
      if (this.props.leaders.includes(leaderId)) {
        return (
          <button className="btn btn-default btn-sm pull-right"onClick={() => this.unFollow(leaderId)}>
            <span className="glyphicon glyphicon-ok"></span>{'  Unfollow'}
          </button>
        );
      } else {
        return (
        // return <img src={'https://s3-us-west-1.amazonaws.com/thegauntletbucket421/' + challenge.filename} width="320" height="240" />;
          <button className="btn btn-default btn-sm pull-right" onClick={() => this.followTheLeader(leaderId)}>
            <span className="glyphicon glyphicon-ok"></span>{'  Follow'}
          </button>
        );
      }   
    }; 
     // {'Upvotes: ' + challenge.upvotes + ' Views: ' + challenge.views}
    let mappedChallenges = this.props.challenges.map((challenge, i) => {
      if (!challenge.parent_id) {
        return (
          <div className="col col-md-6">
            <h4 onClick={() => this.onChallengeClick(challenge)} className="text-center"><Link to={'/challenge'}>{challenge.title}</Link></h4>
            {checkFile(challenge.filename.split('.').pop(), challenge)}<br/>
            <div>
              <Link to={`/profile/${challenge.username}`}>{challenge.username}</Link>
              {whichButton(challenge.user_id)}
              
          <button onClick={()=>{ this.upVoteClick(challenge.id); }} type="button" className="btn btn-default btn-sm pull-right">
            <span className="glyphicon glyphicon-arrow-up"></span>{` Upvote  ${challenge.upvotes}`}
          </button>
            </div>  
          </div>
        );
        
      }
    });

    return <div>{mappedChallenges}</div>;
  }
}

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(ChallengeList);

 