// jshint esversion: 6

import React from 'react';
import ReduxSimonGame from './Simon';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { simonGame } from './state';
import thunk from 'redux-thunk';


let store = createStore(simonGame, applyMiddleware(thunk));

const App = () => {
  let layout = {
    'display': 'flex',
    'alignItems': 'center',
    'justifyContent': 'center',
    'height':'100vh'
  };
  return (
  <div style={layout  }>
    <div style={{flex:'0 0 auto'}}>
    <Provider store={store}>
      <ReduxSimonGame />
    </Provider>
    </div>
  </div>
  )
}

export default App;
