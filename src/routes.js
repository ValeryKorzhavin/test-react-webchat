const host = '';
const prefix = 'api/v1';

export default {
  auth: () => [host, prefix, 'auth'].join('/'),
  channelsPath: () => [host, prefix, 'channels'].join('/'),
  channelPath: id => [host, prefix, 'channels', id].join('/'),
  joinChannelPath: id => [host, prefix, 'channels', id, 'users'].join('/'),
  leaveChannelPath: (channelId, userId) => [host, prefix, 'channels', channelId, 'users', userId].join('/'),
  usersPath: () => [host, prefix, 'users'].join('/'),
  userPath: id => [host, prefix, 'users', id].join('/'),
  publicMessagesPath: id => [host, prefix, 'channels', id, 'messages'].join('/'),
  privateMessagesPath: id => [host, prefix, 'users', id, 'messages'].join('/'),
};
