import React from 'react';
import connect from '../connect';

const mapStateToProps = (state) => {
  const props = {
    isAuthenticated: state.auth.isAuthenticated,
  };
  return props;
};

export default function (ComposedComponent) {
  @connect(mapStateToProps)
  class Authenticate extends React.Component {
    componentWillMount() {
      const { isAuthenticated, addFlashMessage, history } = this.props;
      if (!isAuthenticated) {
        history.push('/');
        addFlashMessage({
          type: 'error',
          text: 'You need to login to access this page',
        });
      }
    }

    componentWillUpdate(nextProps) {
      const { history } = this.props;
      if (!nextProps.isAuthenticated) {
        history.push('/');
      }
    }

    render() {
      return (
        <ComposedComponent {...this.props} />
      );
    }
  }

  return Authenticate;
}
