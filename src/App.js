// jshint esversion: 6

import React from 'react';
import ReduxSimonGame from './Simon';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { simonGame } from './state';
import thunk from 'redux-thunk';


let store = createStore(simonGame, applyMiddleware(thunk));

const App = () => (
  <Provider store={store}>
    <ReduxSimonGame />
  </Provider>
)

export default App;
