import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import connect from '../connect';

const mapStateToProps = state => state;

@connect(mapStateToProps)
class NotFoundPage extends React.Component {
  render() {
    return (
      <div className="d-flex flex-row align-items-center jumbotron">
        <Container>
          <Row className="justify-content-center mb-5 mt-5">
            <Col className="col-md-12 mt-5 mb-5 text-center">
              <span className="display-1 d-block">404</span>
              <div className="mb-4 lead">The page you are looking for was not found.</div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default NotFoundPage;
