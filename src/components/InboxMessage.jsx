import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import connect from '../connect';

const mapStateToProps = state => state;

@connect(mapStateToProps)
class InboxMessage extends React.Component {
  render() {
    const { message: { author: { name }, count } } = this.props;
    return (
      <Container>
        <Row>
          <Col className="text-left">
            {name}
          </Col>
          <Col md="auto">
            <span className="badge badge-pill badge-light">{count}</span>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default InboxMessage;
