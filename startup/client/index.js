/* eslint-disable no-underscore-dangle, no-unused-expressions */

import React from 'react';
import { hydrate, render } from 'react-dom';
import { BrowserRouter, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ApolloProvider } from '@apollo/client';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import App from '../../ui/layouts/App';
import apolloClient from './apollo';
import GlobalStyle from './GlobalStyle';

Bert.defaults.style = 'growl-bottom-right';

Accounts.onLogout(() => apolloClient.resetStore());

Meteor.startup(() => {
  const target = document.getElementById('react-root');
  const app = (
    <ThemeProvider theme={{}}>
      <ApolloProvider client={apolloClient}>
        <GlobalStyle />
        <BrowserRouter>
          <Switch>
            <App />
          </Switch>
        </BrowserRouter>
      </ApolloProvider>
    </ThemeProvider>
  );

  return !window.noSSR ? hydrate(app, target) : render(app, target);
});
