import React from 'react';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import {
  Form, Col, Row, Button, Container,
} from 'react-bootstrap';
import cn from 'classnames';
import { generalChannelSelector } from '../selectors';
import connect from '../connect';

const mapStateToProps = (state, ownProps) => {
  const props = {
    generalChannel: generalChannelSelector(state),
    ownProps,
    auth: state.auth,
  };
  return props;
};

@connect(mapStateToProps)
@reduxForm({
  form: 'newUser',
})
class LoginForm extends React.Component {
  componentWillMount() {
    const { history, auth: { isAuthenticated } } = this.props;
    if (isAuthenticated) {
      history.push('/public/1');
    }
  }

  handleCreateUser = async (values) => {
    const { userName } = values;
    const {
      login,
      reset,
      history,
      generalChannel,
      addFlashMessage,
    } = this.props;

    try {
      await login(userName);
    } catch (error) {
      const message = error.response ? error.response.data.message : error.message;
      throw new SubmissionError({ _error: message });
    }
    history.push(`/public/${generalChannel.id}`);
    addFlashMessage({
      type: 'success',
      text: `You logged in successfully. Welcome ${userName}!`,
    });

    reset();
  };

  render() {
    const {
      handleSubmit, submitting, error,
    } = this.props;

    const classes = cn({
      'form-control': true,
      'is-invalid': error,
    });

    return (
      <Container style={{ position: 'relative', top: '25vh' }}>
        <Row className="justify-content-center">
          <Col className="col-auto">
            <Form noValidate onSubmit={handleSubmit(this.handleCreateUser)}>
              <h2 className="mb-3">Login</h2>
              <Form.Row>
                <Col>
                  <Form.Group className="has-error">
                    <Form.Label className="font-weight-bold">Username</Form.Label>
                    <Field
                      required
                      component="input"
                      disabled={submitting}
                      type="text"
                      name="userName"
                      className={classes}
                      placeholder="Enter your name"
                    />
                    {error && <div className="text-danger mt-1">{error}</div>}
                  </Form.Group>
                </Col>
              </Form.Row>
              <Form.Row>
                <Col>
                  <Form.Group>
                    <Button type="submit" className="col">Login</Button>
                  </Form.Group>
                </Col>
              </Form.Row>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default LoginForm;
