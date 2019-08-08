import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/application.css';

import gon from 'gon';
import io from 'socket.io-client';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import { keyBy, map } from 'lodash';
import jwt from 'jsonwebtoken';
import { createHashHistory } from 'history';
import { routerMiddleware, ConnectedRouter } from 'connected-react-router';
import * as actions from './actions';
import reducers from './reducers';
import App from './components/App';
import setAuthorizationToken from './utils/setAuthorizationToken';


/* eslint-disable no-underscore-dangle */
const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;
/* eslint-enable */

const history = createHashHistory();

const inbox = localStorage.getItem('inbox');

const store = createStore(
  reducers(history),
  {
    currentChannelId: gon.currentChannelId,
    currentDialog: gon.currentDialog,
    channels: {
      byId: keyBy(gon.channels, 'id'),
      allIds: map(gon.channels, 'id'),
    },
    messages: {
      byId: keyBy(gon.messages, 'id'),
      allIds: map(gon.messages, 'id'),
    },
    users: {
      byId: keyBy(gon.users, 'id'),
      allIds: map(gon.users, 'id'),
    },
    inbox: (inbox && JSON.parse(inbox)) || {},
  },
  compose(
    applyMiddleware(thunk),
    applyMiddleware(routerMiddleware(history)),
    devToolsExtension ? devToolsExtension() : f => f,
  ),
);

const jwtToken = localStorage.getItem('jwtToken');
if (jwtToken) {
  setAuthorizationToken(jwtToken);
  const user = jwt.decode(jwtToken);
  store.dispatch(actions.setCurrentUser(user));
}

const socket = io();
socket
  .on('newMessage', ({ data }) => {
    const { type, attributes } = data;
    const { auth: { user }, currentDialog } = store.getState();
    if (type === 'public') {
      store.dispatch(actions.addMessage(attributes));
    } else if (user.id === attributes.userId || user.id === attributes.author.id) {
      store.dispatch(actions.addMessage(attributes));
    }
    if (type === 'private' && user.id === attributes.userId) {
      if (currentDialog.type !== 'private' && currentDialog.id !== attributes.author.id) {
        store.dispatch(actions.addInboxMessage(attributes));
      }
    }
  })
  .on('newUser', ({ data: { token } }) => {
    const user = jwt.decode(token);
    store.dispatch(actions.addUser(user));
  })
  .on('deleteUser', ({ data: { user } }) => {
    const { currentDialog: { id, type } } = store.getState();
    if (type === 'private' && id === user.id) {
      store.dispatch(actions.markUserLogout(user));
    } else {
      store.dispatch(actions.deleteUser(user));
    }
  })
  .on('updateChannelUsers', ({ data: { channel } }) => {
    store.dispatch(actions.updateChannelUsers(channel));
  });


render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Route path="/" component={App} />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('chat'),
);


if (process.env.NODE_ENV !== 'production') {
  localStorage.debug = 'chat:*';
}
