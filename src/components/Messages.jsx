import React from 'react';
import { createHash } from 'crypto';
import ScrollBars from 'react-custom-scrollbars';
import { Alert } from 'react-bootstrap';
import connect from '../connect';
import {
  messagesSelector,
  inboxSelector,
  usersSelector,
  allUsersSelector,
  getCurrentDialog,
  channelsSelector,
  getChannelsAllIds,
  getUsersAllIds,
  currentChannelSelector,
  generalChannelSelector,
} from '../selectors';
import NewMessageForm from './NewMessageForm';


const mapStateToProps = (state, ownProps) => {
  const props = {
    messages: messagesSelector(state),
    allUsers: allUsersSelector(state),
    users: usersSelector(state),
    channels: channelsSelector(state),
    channelsAllIds: getChannelsAllIds(state),
    usersAllIds: getUsersAllIds(state),
    ownProps,
    currentChannelId: state.currentChannelId,
    auth: state.auth,
    currentDialog: getCurrentDialog(state),
    currentChannel: currentChannelSelector(state),
    generalChannel: generalChannelSelector(state),
    inbox: inboxSelector(state),
  };
  return props;
};

const checkUrl = (props) => {
  const {
    ownProps,
    history,
    channels,
    changeCurrentChannel,
    currentChannelId,
    auth,
    channelsAllIds,
    usersAllIds,
    joinChannel,
    leaveChannel,
    currentDialog,
    generalChannel,
    changeCurrentDialog,
    inbox,
    deleteInboxMessage,
    allUsers,
    deleteUser,
  } = props;

  const dialog = ownProps.match.params;
  const id = Number(dialog.id);
  const { type } = dialog;

  if (currentDialog.type === type && currentDialog.id === id) {
    return true;
  }

  // delete user that logged out
  if (currentDialog.type === 'private') {
    const user = allUsers.find(u => u.id === currentDialog.id);
    if (user && user.loggedOut) {
      deleteUser(user);
    }
  }

  const onPublicToPublic = () => {
    leaveChannel(currentChannelId, auth.user.id);
    joinChannel(id, auth.user.id);
    changeCurrentDialog({ type, id });
    changeCurrentChannel(id);
    history.push(`/${type}/${id}`);
  };

  const onPublicToPrivate = () => {
    const inboxMessage = inbox.find(message => message.author.id === id);
    if (inboxMessage) {
      deleteInboxMessage(inboxMessage);
    }
    changeCurrentDialog({ id, type });
    history.push(`/${type}/${id}`);
  };

  const onPrivateToPrivate = onPublicToPrivate;

  const onPrivateToPublic = () => {
    const channel = channels.find(c => c.id === id);
    if (!channel.users.includes(auth.user.id)) {
      const whereWasUser = channels.find(c => c.users.includes(auth.user.id));
      if (!whereWasUser) {
        return true;
      }
      leaveChannel(whereWasUser.id, auth.user.id);
      joinChannel(id, auth.user.id);
      changeCurrentChannel(id);
      changeCurrentDialog({ id, type });
      history.push(`/${type}/${id}`);
    } else {
      changeCurrentDialog({ id, type });
      history.push(`/${type}/${id}`);
    }
    return true;
  };

  const onPublicToWrong = () => {
    if (currentChannelId !== generalChannel.id) {
      leaveChannel(currentChannelId, auth.user.id);
      joinChannel(generalChannel.id, auth.user.id);
      changeCurrentChannel(generalChannel.id);
      changeCurrentDialog({ type: 'public', id: generalChannel.id });
      history.push('/public/1');
    }
  };

  const onPrivateToWrong = () => {
    if (!generalChannel.users.includes(auth.user.id)) {
      const whereWasUser = channels.find(c => c.users.includes(auth.user.id));
      if (!whereWasUser) {
        return true;
      }
      leaveChannel(whereWasUser.id, auth.user.id);
      joinChannel(generalChannel.id, auth.user.id);
      changeCurrentChannel(generalChannel.id);
    }
    changeCurrentDialog({ type: 'public', id: generalChannel.id });
    history.push('/public/1');
    return true;
  };

  const destinationMap = {
    public: dsetId => (channelsAllIds.includes(dsetId) ? 'public' : 'wrong'),
    private: dsetId => (usersAllIds.includes(dsetId) ? 'private' : 'wrong'),
  };

  const methods = {
    private: {
      private: () => onPrivateToPrivate(),
      public: () => onPrivateToPublic(),
      wrong: () => onPrivateToWrong(),
    },
    public: {
      public: () => onPublicToPublic(),
      private: () => onPublicToPrivate(),
      wrong: () => onPublicToWrong(),
    },
  };

  const destination = destinationMap[type](id);
  return methods[currentDialog.type][destination]();
};

@connect(mapStateToProps)
class Messages extends React.Component {
  constructor(props) {
    super(props);
    checkUrl(props);
  }

  shouldComponentUpdate(nextProps) {
    checkUrl(nextProps);
    return true;
  }

  render() {
    const {
      messages, currentDialog, allUsers, channels,
    } = this.props;
    const mapping = {
      public: {
        object: id => channels.find(c => c.id === id),
        title: () => 'Messages in chat room: ',
        name: obj => <span className="font-weight-bold">{obj.name}</span>,
      },
      private: {
        object: id => allUsers.find(u => u.id === id),
        title: () => 'Private messages with user: ',
        name: obj => <span className="font-weight-bold">{obj.name}</span>,
      },
    };

    const obj = mapping[currentDialog.type];
    const object = obj.object(currentDialog.id);
    const title = object ? obj.title(object) : 'none';
    const name = object ? obj.name(object) : 'none';

    const list = messages.map(({
      author, message, id, time,
    }) => {
      const hash = createHash('md5').update(author.name).digest('hex');
      const avatarSize = 40;
      const avatar = `https://www.gravatar.com/avatar/${hash}?d=wavatar&s=${avatarSize}`;

      return (
        <div className="media mb-2" key={id}>
          <img src={avatar} className="mr-2 rounded" alt="avatar" />
          <div className="media-body">
            <div className="mt-0">
              <span className="font-weight-bold">
                {author.name}
              </span>
              <small className="text-muted ml-2 h7">
                {time}
              </small>
            </div>
            {message}
          </div>
        </div>
      );
    });
    return (
      <>
        <Alert variant="secondary">
          {title}
          {name}
        </Alert>
        <ScrollBars autoHeight autoHeightMin="70vh">
          <div style={{ height: '60vh' }}>
            {list}
          </div>
        </ScrollBars>
        <NewMessageForm />
      </>
    );
  }
}

export default Messages;
