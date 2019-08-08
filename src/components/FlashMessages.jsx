import React from 'react';
import connect from '../connect';
import FlashMessage from './FlashMessage';
import { flashMessagesSelector } from '../selectors';

const mapStateToProps = (state) => {
  const props = {
    messages: flashMessagesSelector(state),
  };
  return props;
};

@connect(mapStateToProps)
class FlashMessages extends React.Component {
  render() {
    const { messages } = this.props;
    const messagesList = messages.map(message => (
      <FlashMessage key={message.id} message={message} />
    ));

    return (
      <div className="mt-3">
        {messagesList}
      </div>
    );
  }
}

export default FlashMessages;
