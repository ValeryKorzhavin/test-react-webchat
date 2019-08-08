import React from 'react';
import connect from '../connect';

const mapStateToProps = state => state;

@connect(mapStateToProps)
class User extends React.Component {
  render() {
    const { user: { name } } = this.props;

    return (
      <div>{name}</div>
    );
  }
}

export default User;
