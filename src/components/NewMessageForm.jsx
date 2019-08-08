import React from 'react';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import Hotkeys from 'react-hot-keys';
import connect from '../connect';
import { getCurrentDialog } from '../selectors';


const mapStateToProps = (state) => {
  const props = {
    currentDialog: getCurrentDialog(state),
    auth: state.auth,
  };
  return props;
};

@connect(mapStateToProps)
@reduxForm({
  form: 'newMessage',
})
class NewMessageForm extends React.Component {
  handleAddMessage = async (values) => {
    const { message } = values;
    const {
      sendMessage, currentDialog, reset, auth,
    } = this.props;
    const author = auth.user;
    const date = new Date();
    const time = date.toLocaleString([], { hour: 'numeric', minute: 'numeric', hour12: true });
    try {
      await sendMessage({ author, message, time }, currentDialog);
    } catch (error) {
      throw new SubmissionError({ _error: error.message });
    }
    reset();
  };

  render() {
    const {
      handleSubmit, submitting, error, submit,
    } = this.props;
    return (
      <div className="mt-3">
        <Hotkeys keyName="Enter" onKeyUp={submit}>
          <form className="form-inline" onSubmit={handleSubmit(this.handleAddMessage)}>
            <Field
              required
              component="input"
              disabled={submitting}
              type="text"
              name="message"
              palceholder="type your message"
              className="form-control mr-sm-2 col"
            />
            {error && <div className="text-danger mt-1">{error}</div>}
          </form>
        </Hotkeys>
      </div>
    );
  }
}

export default NewMessageForm;
