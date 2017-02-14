import React from 'react';
import ChallengeTable from './ChallengeTable.jsx';
import {Jumbotron, Col, Row, Button, Grid, Nav, NavItem} from 'react-bootstrap';
import actions from '../../redux/actions';
import $ from 'jquery';

class Dash extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let outer = this;
    $.get('/api/allChallenges').done(data => {
      data = data.reverse();
      outer.props.dispatch(actions.addChallenge(data));
    });
  }

  render() {
    return (
      <div>
        <ChallengeTable dispatch={this.props.dispatch} />
      </div>
    );
  }
}

export default Dash;

