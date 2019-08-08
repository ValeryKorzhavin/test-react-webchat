import React from 'react';
import {
  Nav, Navbar, NavDropdown,
} from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import ScrollBars from 'react-custom-scrollbars';
import {
  channelsSelector,
  inboxSelector,
  getCurrentChannelId,
  allUsersSelector,
  currentChannelSelector,
  getCurrentDialog,
} from '../selectors';
import connect from '../connect';

const mapStateToProps = (state, ownProps) => {
  const props = {
    auth: state.auth,
    channels: channelsSelector(state),
    currentChannelId: getCurrentChannelId(state),
    currentDialog: getCurrentDialog(state),
    ownProps,
    currentChannel: currentChannelSelector(state),
    users: allUsersSelector(state),
    inbox: inboxSelector(state),
  };
  return props;
};

@connect(mapStateToProps)
class NavigationBar extends React.Component {
  logout = async () => {
    const {
      logout,
      history,
      auth: { user },
      currentChannelId,
      leaveChannel,
    } = this.props;
    leaveChannel(currentChannelId, user.id);
    try {
      await logout(user.id);
    } catch (error) {
      throw error;
    }
    history.push('/');
  };

  render() {
    const { auth: { isAuthenticated } } = this.props;
    const { channels, users, currentChannelId } = this.props;
    const channelsList = channels.map(channel => (
      <NavDropdown.Item eventKey={channel.id} as={NavLink} key={channel.id} to={`/public/${channel.id}`}>
        {channel.name}
      </NavDropdown.Item>
    ));
    const usersList = users.map(user => (
      <NavDropdown.Item as={NavLink} eventKey={user.id} key={user.id} to={`/private/${user.id}`}>
        {user.name}
      </NavDropdown.Item>
    ));

    return (
      <Navbar collapseOnSelect expand="lg" bg="light" variant="light" className="shadow border border-light rounded">
        <Navbar.Brand href="#home">Chat Rooms</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto" />
          {
            isAuthenticated && (
            <>
              <Nav>
                <NavDropdown title="All users" id="collasible-nav-dropdown">
                  <ScrollBars
                    autoHeight
                    autoHeightMax="40vh"
                    renderTrackHorizontal={props => <div {...props} style={{ display: 'none' }} className="track-horizontal" />}
                  >
                    {usersList}
                  </ScrollBars>
                </NavDropdown>
              </Nav>
              <Nav activeKey={currentChannelId}>
                <NavDropdown title="Chat rooms" id="collasible-nav-dropdown">
                  {channelsList}
                </NavDropdown>
              </Nav>
              <Nav>
                <Nav.Link href="#" onClick={this.logout}>Logout</Nav.Link>
              </Nav>
            </>
            )
          }
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default NavigationBar;
