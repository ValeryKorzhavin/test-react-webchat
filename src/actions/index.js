import axios from 'axios';
import { createAction } from 'redux-actions';
import jwt from 'jsonwebtoken';
import routes from '../routes';
import setAuthorizationToken from '../utils/setAuthorizationToken';


export const loginRequest = createAction('LOGIN_REQUEST');
export const loginSuccess = createAction('LOGIN_SUCCESS');
export const loginFailure = createAction('LOGIN_FAILURE');

export const logoutRequest = createAction('LOGOUT_REQUEST');
export const logoutSuccess = createAction('LOGOUT_SUCCESS');
export const logoutFailure = createAction('LOGOUT_FAILURE');

export const joinChannelRequest = createAction('JOIN_CHANNEL_REQUEST');
export const joinChannelSuccess = createAction('JOIN_CHANNEL_SUCCESS');
export const joinChannelFailure = createAction('JOIN_CHANNEL_FAILURE');

export const leaveChannelRequest = createAction('LEAVE_CHANNEL_REQUEST');
export const leaveChannelSuccess = createAction('LEAVE_CHANNEL_SUCCESS');
export const leaveChannelFailure = createAction('LEAVE_CHANNEL_FAILURE');

export const sendMessageRequest = createAction('MESSAGE_SEND_REQUEST');
export const sendMessageSuccess = createAction('MESSAGE_SEND_SUCCESS');
export const sendMessageFailure = createAction('MESSAGE_SEND_FAILURE');

export const createUserRequest = createAction('USER_CREATE_REQUEST');
export const createUserSuccess = createAction('USER_CREATE_SUCCESS');
export const createUserFailure = createAction('USER_CREATE_FAILURE');

export const addUser = createAction('USER_ADD');
export const deleteUser = createAction('USER_DELETE');

export const addMessage = createAction('MESSAGE_ADD');
export const changeCurrentDialog = createAction('CURRENT_DIALOG_CHANGE');

export const changeCurrentChannel = createAction('CURRENT_CHANNEL_CHANGE');
export const updateChannelUsers = createAction('CHANNEL_USERS_UPDATE');

export const addInboxMessage = createAction('INBOX_MESSAGE_ADD');
export const deleteInboxMessage = createAction('INBOX_MESSAGE_DELETE');
export const clearInbox = createAction('INBOX_CLEAR');

export const addFlashMessage = createAction('FLASH_MESSAGE_ADD');
export const deleteFlashMessage = createAction('FLASH_MESSAGE_DELETE');

export const setCurrentUser = createAction('CURRENT_USER_SET');
export const markUserLogout = createAction('USER_LOGOUT_MARK');


export const joinChannel = (channelId, userId) => async (dispatch) => {
  dispatch(joinChannelRequest());
  try {
    const url = routes.joinChannelPath(channelId);
    await axios.post(url, { data: { attributes: { userId } } });
    dispatch(joinChannelSuccess());
  } catch (e) {
    dispatch(joinChannelFailure());
    throw e;
  }
};
export const leaveChannel = (channelId, userId) => async (dispatch) => {
  dispatch(leaveChannelRequest());
  try {
    const url = routes.leaveChannelPath(channelId, userId);
    await axios.delete(url);
    dispatch(leaveChannelSuccess());
  } catch (e) {
    dispatch(leaveChannelFailure());
    throw e;
  }
};

export const sendMessage = ({ author, message, time }, dialog) => async (dispatch) => {
  dispatch(sendMessageRequest());
  try {
    const url = routes[`${dialog.type}MessagesPath`](dialog.id);
    await axios.post(url, {
      data: {
        attributes: {
          author, message, time, dialog,
        },
      },
    });
    dispatch(sendMessageSuccess());
  } catch (e) {
    dispatch(sendMessageFailure());
    throw e;
  }
};

export const login = name => async (dispatch, getState) => {
  const { currentChannelId } = getState();
  dispatch(loginRequest());
  try {
    const url = routes.auth();
    const response = await axios.post(url, { data: { attributes: { name } } });
    const { token } = response.data;
    localStorage.setItem('jwtToken', token);
    setAuthorizationToken(token);
    const user = jwt.decode(token);
    dispatch(setCurrentUser(user));
    dispatch(joinChannel(currentChannelId, user.id));
    dispatch(loginSuccess());
  } catch (e) {
    dispatch(loginFailure());
    throw e;
  }
};

export const logout = userId => async (dispatch) => {
  dispatch(logoutRequest());
  try {
    const url = routes.userPath(userId);
    await axios.delete(url);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('inbox');
    setAuthorizationToken(false);
    dispatch(setCurrentUser({}));
    dispatch(clearInbox());
    dispatch(logoutSuccess());
  } catch (e) {
    dispatch(logoutFailure());
    throw e;
  }
};
