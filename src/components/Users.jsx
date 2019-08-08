import React from 'react';
import { Nav, Alert } from 'react-bootstrap';
import ScrollBars from 'react-custom-scrollbars';
import { NavLink } from 'react-router-dom';
import {
  usersSelector, getCurrentDialog, inboxSelector, currentChannelSelector,
} from '../selectors';
import User from './User';
import connect from '../connect';
import InboxMessage from './InboxMessage';

const mapStateToProps = (state) => {
  const props = {
    users: usersSelector(state),
    currentDialog: getCurrentDialog(state),
    auth: state.auth,
    inbox: inboxSelector(state),
    currentChannel: currentChannelSelector(state),
  };
  return props;
};

@connect(mapStateToProps)
class Users extends React.Component {
  render() {
    const {
      users, currentDialog, inbox, currentChannel,
    } = this.props;
    const usersList = users.map(user => (
      <Nav.Link as={NavLink} eventKey={user.id} key={user.id} to={`/private/${user.id}`}>
        <User user={user} />
      </Nav.Link>
    ));
    const inboxList = inbox.map(message => (
      <Nav.Link
        className="btn btn-primary"
        as={NavLink}
        eventKey={message.author.id}
        key={message.id}
        to={`/private/${message.author.id}`}
      >
        <InboxMessage message={message} />
      </Nav.Link>
    ));

    return (
      <>
        <Alert variant="secondary">
          Users of Room:
          {' '}
          <span className="font-weight-bold">{currentChannel.name}</span>
        </Alert>
        <ScrollBars autoHeight autoHeightMin="40vh">
          <Nav
            variant="pills"
            className="flex-column"
            activeKey={currentDialog.id}
          >
            {usersList}
          </Nav>
        </ScrollBars>
        <Alert variant="secondary">Inbox messages:</Alert>
        <ScrollBars autoHeight autoHeightMin="30vh">
          <Nav
            variant="pills"
            className="flex-column"
            onSelect={this.handleSelect}
          >
            {inboxList}
          </Nav>
        </ScrollBars>
      </>
    );
  }
}

export default Users;
