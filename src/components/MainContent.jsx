import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Route } from 'react-router-dom';
import connect from '../connect';
import Messages from './Messages';
import Users from './Users';
import authRequired from '../utils/authRequired';

const mapStateToProps = state => state;

@connect(mapStateToProps)
@authRequired
class MainContent extends React.Component {
  render() {
    return (
      <Container className="mt-3">
        <Row>
          <Col className="col-md-4">
            <Users />
          </Col>
          <Col className="col-md-8">
            <Route path="/:type/:id" component={Messages} />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default MainContent;
