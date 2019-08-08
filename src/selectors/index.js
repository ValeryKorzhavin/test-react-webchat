import { createSelector } from 'reselect';
import {
  pickBy, pick, find, omit, intersection,
} from 'lodash';

export const getCurrentDialog = state => state.currentDialog;
export const getCurrentUser = state => state.auth.user;
export const getChannels = state => state.channels.byId;
export const getMessages = state => state.messages.byId;
export const getUsers = state => state.users.byId;
export const getInboxMessages = state => state.inbox;
export const getFlashMessages = state => state.flashMessages;
export const getChannelsAllIds = state => state.channels.allIds;
export const getUsersAllIds = state => state.users.allIds;
export const getCurrentChannelId = state => state.currentChannelId;


export const allUsersSelector = createSelector(
  [getUsers, getCurrentUser],
  (users, currentUser) => Object.values(omit(users, currentUser.id)),
);

export const flashMessagesSelector = createSelector(
  getFlashMessages,
  messages => Object.values(messages),
);

export const inboxSelector = createSelector(
  getInboxMessages,
  inbox => Object.values(inbox),
);

export const publicMessagesSelector = createSelector(
  getMessages,
  messages => Object.values(pickBy(messages, message => message.dialog.type === 'public')),
);

export const privateMessagesSelector = createSelector(
  getMessages,
  messages => Object.values(pickBy(messages, message => message.dialog.type === 'private')),
);

export const messagesSelector = createSelector(
  [getMessages, getCurrentDialog, getCurrentUser],
  (messages, currentDialog, currentUser) => Object.values(pickBy(messages, (message) => {
    if (currentDialog.type !== message.dialog.type) {
      return false;
    }
    if (message.dialog.type === 'public') {
      return currentDialog.id === message.channelId;
    }
    const ids1 = [message.author.id, message.userId];
    const ids2 = [currentUser.id, currentDialog.id];
    return intersection(ids1, ids2).length === 2;
  })),
);

export const channelsSelector = createSelector(
  getChannels,
  channels => Object.values(channels),
);

export const generalChannelSelector = createSelector(
  channelsSelector,
  channels => find(channels, channel => (channel.id === 1)),
);

export const currentChannelSelector = createSelector(
  [channelsSelector, getCurrentChannelId],
  (channels, currentChannelId) => find(channels, channel => channel.id === currentChannelId),
);

export const usersSelector = createSelector(
  [getUsers, getCurrentUser, currentChannelSelector],
  (users, currentUser, currentChannel) => (
    Object.values(omit(pick(users, currentChannel.users), currentUser.id))
  ),
);
