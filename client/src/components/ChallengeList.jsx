import React from 'react';
import { connect } from 'react-redux';
import actions from '../../redux/actions.js';
import ChallengeComponent from './ChallengeComponent.jsx';
import { Link } from 'react-router';

class ChallengeList extends React.Component {
  constructor(props) {
    super(props);

    this.onChallengeClick = this.onChallengeClick.bind(this);
  }

  onChallengeClick(challenge) {
    console.log('clicked here', challenge);
    window.sessionStorage.setItem('title', challenge.title);
    window.sessionStorage.setItem('id', challenge.id);
    window.sessionStorage.setItem('description', challenge.description);
    window.sessionStorage.setItem('category', challenge.category);
    window.sessionStorage.setItem('filename', challenge.filename);
    window.sessionStorage.setItem('upvotes', challenge.upvotes);
    window.sessionStorage.setItem('views', challenge.views);
    $.get('/api/challenge/' + challenge.id)
    return (
      <ChallengeComponent challenge={challenge} />
    );
    window.location.href = '/#/challenge';
  }

  // src={'https://s3-us-west-1.amazonaws.com/thegauntletbucket420/' + challenge.filename}

  render() {
    let checkFile = (type, challenge) => {
      const fileType = {
        'mp4': 'THIS IS A VIDEO!'
      };
      console.log(fileType[type]);
      if (fileType[type]) {
        return (<video width="320" height="240" controls>
          {/*<source src={'https://s3-us-west-1.amazonaws.com/thegauntletbucket420/' + challenge.filename} type="video/mp4"/>*/}
        </video>);
      } else {
        return <img width="320" height="240" />;
      }
    };
        // <a href='/#/profile'>{challenge.}
        // <a href='/#/challenge'>{challenge.title}</a>
    let mappedChallenges = this.props.challenges.map((challenge, i) => {
      console.log(challenge)
      return <div onClick={() => this.onChallengeClick(challenge)}>
        <h1><Link to={'/challenge'}>{challenge.title}</Link></h1>
        {checkFile(challenge.filename.split('.').pop(), challenge)}<br/>
        <Link to={`/profile/${challenge.username}`}>{challenge.username}</Link><br/>
        {'Upvotes: ' + challenge.upvotes + ' Views: ' + challenge.views}
      </div>;
    });

    return <div>
            {mappedChallenges}
           </div>;
  }
}

const mapStateToProps = (state) => {
  return state;
};

export default connect(mapStateToProps)(ChallengeList);
