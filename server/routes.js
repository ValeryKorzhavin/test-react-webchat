import _ from 'lodash';
import faker from 'faker';
import Router from 'koa-router';
import jwt from 'jsonwebtoken';
import config from '../config';

const getNextId = () => Number(_.uniqueId());

const getRandomChannel = () => ({
  id: getNextId(),
  name: faker.company.catchPhraseNoun(),
  removable: true,
  users: [],
});

export default (router, io) => {
  const generalChannelId = getNextId();
  const channelsCount = 8;
  const channels = Array.from(new Array(channelsCount), getRandomChannel);

  const defaultState = {
    channels: [
      {
        id: generalChannelId,
        name: 'general',
        removable: false,
        users: [],
      },
      ...channels,
    ],
    messages: [],
    users: [],
    currentDialog: { id: generalChannelId, type: 'public' },
    currentChannelId: generalChannelId,
    auth: { isAuthenticated: false, user: {} },
  };

  const state = { ...defaultState };

  const apiRouter = new Router();
  apiRouter
    .post('/auth', (ctx) => {
      const { data: { attributes: { name } } } = ctx.request.body;
      const error = {};
      const existingUser = state.users.find(user => user.name === name);

      if (!name) {
        error.message = 'This field is required';
      } else if (name.length > 15) {
        error.message = 'Must be 15 characters or less';
      } else if (existingUser) {
        error.message = 'This username is already taken';
      }

      if (_.isEmpty(error)) {
        const user = {
          name,
          id: getNextId(),
          loggedOut: false,
        };
        state.users.push(user);
        const token = jwt.sign(user, config.jwtSecret);
        ctx.status = 201;
        ctx.body = { token };
        io.emit('newUser', { data: { token } });
      } else {
        ctx.body = error;
        ctx.status = 401;
      }
    })
    .delete('/users/:id', (ctx) => {
      const userId = Number(ctx.params.id);
      const user = state.users.find(u => u.id === userId);
      state.users = state.users.filter(u => u.id !== userId);
      ctx.status = 204;
      const data = {
        data: {
          type: 'users',
          user: {
            ...user,
            loggedOut: true,
          },
        },
      };
      io.emit('deleteUser', data);
    })
    .get('/users', (ctx) => {
      ctx.body = state.users;
    })
    .get('/channels', (ctx) => {
      ctx.body = state.channels;
      ctx.status = 301;
    })
    .get('/channels/:channelId/messages', (ctx) => {
      const messages = state.messages.filter(m => m.channelId === Number(ctx.params.channelId));
      const resources = messages.map(m => ({
        type: 'messages',
        id: m.id,
        attributes: m,
      }));
      ctx.body = resources;
    })
    .post('/channels/:channelId/messages', (ctx) => {
      const { data: { attributes } } = ctx.request.body;
      const message = {
        ...attributes,
        channelId: Number(ctx.params.channelId),
        id: getNextId(),
      };
      state.messages.push(message);
      ctx.status = 201;
      const data = {
        data: {
          type: 'public',
          id: message.id,
          attributes: message,
        },
      };
      ctx.body = data;
      io.emit('newMessage', data);
    })
    .post('/channels/:channelId/users', (ctx) => {
      const { data: { attributes: { userId } } } = ctx.request.body;
      const channelId = Number(ctx.params.channelId);
      const channel = state.channels.find(c => c.id === channelId);
      channel.users.push(userId);
      ctx.status = 201;
      // const data = {
      //   data: {
      //     type: 'users',
      //     channelId,
      //     userId,
      //   },
      // };
      const data = {
        data: {
          type: 'users',
          channel,
        },
      };
      ctx.body = data;
      io.emit('updateChannelUsers', data);
    })
    .get('/channels/:channelId/users', (ctx) => {
      const channel = state.channels.find(c => c.id === Number(ctx.params.channelId));
      const resources = channel.users.map(id => ({ type: 'users', id }));
      ctx.body = resources;
    })
    .delete('/channels/:channelId/users/:userId', (ctx) => {
      const userId = Number(ctx.params.userId);
      const channelId = Number(ctx.params.channelId);
      const channel = state.channels.find(c => c.id === channelId);

      channel.users = channel.users.filter(id => id !== userId);

      ctx.status = 204;
      // const data = {
      //   data: {
      //     type: 'users',
      //     userId,
      //     channelId,
      //   },
      // };
      const data = {
        data: {
          type: 'users',
          channel,
        },
      };
      ctx.body = data;
      io.emit('updateChannelUsers', data);
    })
    .get('/users/:id/messages', (ctx) => {
      const { id } = ctx.params;
      const messages = state.messages.filter(m => m.userId === id && m.dialog.type === 'private');
      const resources = messages.map(m => ({
        type: 'private',
        id: m.id,
        attributes: m,
      }));
      ctx.body = resources;
    })
    .post('/users/:id/messages', (ctx) => {
      const { data: { attributes } } = ctx.request.body;
      const message = {
        ...attributes,
        id: getNextId(),
        userId: Number(ctx.params.id),
      };
      state.messages.push(message);
      ctx.status = 201;
      const data = {
        data: {
          type: 'private',
          id: message.id,
          attributes: message,
        },
      };
      ctx.body = data;
      io.emit('newMessage', data);
    });

  return router
    .get('root', '/', (ctx) => {
      ctx.render('index', { gon: state });
    })
    .use('/api/v1', apiRouter.routes(), apiRouter.allowedMethods());
};
