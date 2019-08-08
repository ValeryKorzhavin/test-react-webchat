import React from 'react';
import { Alert } from 'react-bootstrap';
import cn from 'classnames';
import connect from '../connect';

const mapStateToProps = state => state;

@connect(mapStateToProps)
class FlashMessage extends React.Component {
  handleClose = () => {
    const { deleteFlashMessage, message } = this.props;
    deleteFlashMessage(message);
  }

  render() {
    const { message: { type, text } } = this.props;
    const variant = cn({
      success: type === 'success',
      danger: type === 'error',
    });
    return (
      <Alert variant={variant}>
        {text}
        <button type="button" onClick={this.handleClose} className="close">&times;</button>
      </Alert>
    );
  }
}

export default FlashMessage;
