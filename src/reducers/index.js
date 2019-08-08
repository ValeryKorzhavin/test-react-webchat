import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';
import { reducer as formReducer } from 'redux-form';
import { connectRouter } from 'connected-react-router';
import {
  omit,
  without,
  omitBy,
  map,
  isEmpty,
  has,
  uniqueId,
} from 'lodash';
import * as actions from '../actions';

const channels = handleActions({
  [actions.updateChannelUsers](state, { payload: channel }) {
    const { byId, allIds } = state;
    return {
      byId: { ...byId, [channel.id]: channel },
      allIds,
    };
  },
}, {});

const messages = handleActions({
  [actions.addMessage](state, { payload: message }) {
    const { byId, allIds } = state;
    return {
      byId: { ...byId, [message.id]: message },
      allIds: [...allIds, message.id],
    };
  },
  [actions.deleteUser](state, { payload: user }) {
    const shouldDelete = ({ dialog, author, userId }) => (
      dialog.type === 'private' && (userId === user.id || author.id === user.id)
    );
    const byId = omitBy(state.byId, shouldDelete);
    const allIds = map(byId, 'id');
    return { byId, allIds };
  },
}, {});


// UI state inbox messages
const inbox = handleActions({
  [actions.addInboxMessage](state, { payload: message }) {
    let inboxMessage = {};
    if (has(state, message.author.id)) {
      const { count } = state[message.author.id];
      inboxMessage = { ...state, [message.author.id]: { ...message, count: count + 1 } };
    } else {
      inboxMessage = { ...state, [message.author.id]: { ...message, count: 1 } };
    }
    localStorage.setItem('inbox', JSON.stringify(inboxMessage));
    return inboxMessage;
  },
  [actions.deleteInboxMessage](state, { payload: message }) {
    const inboxMessage = omit(state, message.author.id);
    localStorage.setItem('inbox', JSON.stringify(inboxMessage));
    return inboxMessage;
  },
  [actions.clearInbox]() {
    return {};
  },
}, {});

const users = handleActions({
  [actions.addUser](state, { payload: user }) {
    const { byId, allIds } = state;
    return {
      byId: { ...byId, [user.id]: user },
      allIds: [...allIds, user.id],
    };
  },
  [actions.deleteUser](state, { payload: user }) {
    const { byId, allIds } = state;
    return {
      byId: omit(byId, user.id),
      allIds: without(allIds, user.id),
    };
  },
  [actions.markUserLogout](state, { payload: user }) {
    const { byId, allIds } = state;
    return {
      byId: { ...byId, [user.id]: user },
      allIds,
    };
  },
}, {});

const currentDialog = handleActions({
  [actions.changeCurrentDialog](state, { payload: dialog }) {
    return dialog;
  },
}, {});

const currentChannelId = handleActions({
  [actions.changeCurrentChannel](state, { payload: channelId }) {
    return channelId;
  },
}, {});

const flashMessages = handleActions({
  [actions.addFlashMessage](state, { payload: message }) {
    const id = uniqueId();
    return { ...state, [id]: { id, ...message } };
  },
  [actions.deleteFlashMessage](state, { payload: message }) {
    return omit(state, message.id);
  },
}, {});

const auth = handleActions({
  [actions.setCurrentUser](state, { payload: user }) {
    return {
      isAuthenticated: !isEmpty(user),
      user,
    };
  },
}, { isAuthenticated: false, user: {} });


export default history => combineReducers({
  channels,
  messages,
  inbox,
  users,
  auth,
  flashMessages,
  currentDialog,
  currentChannelId,
  form: formReducer,
  router: connectRouter(history),
});
