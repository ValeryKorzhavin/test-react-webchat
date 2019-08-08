import React from 'react';
import { Route, Switch } from 'react-router-dom';
import connect from '../connect';
import MainContent from './MainContent';
import LoginForm from './LoginForm';
import NavigationBar from './NavigationBar';
import FlashMessages from './FlashMessages';
import NotFoundPage from './NotFoundPage';

const mapStateToProps = state => state;

@connect(mapStateToProps)
class App extends React.Component {
  render() {
    return (
      <>
        <NavigationBar />
        <FlashMessages />
        <Switch>
          <Route exact path="/" component={LoginForm} />
          <Route path={['/public', '/private']} component={MainContent} />
          <Route component={NotFoundPage} />
        </Switch>
      </>
    );
  }
}

export default App;
