//jshint esversion: 6

import { combineReducers } from 'redux';

/* TODO :
- vitazstvo po 20 uspesnych tahoch : zobrazi ** na display a zatrubi
- zrychlovanie tahov
- po stlaceni a drzani big buttonu hra ton a zaroven svieti buton
*/

//audio
const simon_audio = {
  'lu': new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
  'ru': new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),
  'ld': new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'),
  'rd': new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'),
  playing: []
};
export const simon_play = (type) => {
  simon_audio[type].loop = true;
  simon_audio[type].play();
  simon_audio.playing.push(type);
};
export const simon_play_stop = () => {
  simon_audio.playing.map(
    e=>{simon_audio[e].loop=false;}
  );
  simon_audio.playing=[];
};

// action creators
export const gameSwitch = () => {
  return {
    type: 'SWITCH_GAME'
  };
};
export const strictSwitch = () => {
  return {
    type: 'SWITCH_STRICT'
  };
};
export const bigButtonPress = (btn_id) => {
  return {
    type: 'BIG_BTN_PRESS',
    btn_id
  };
};
export const initStart = (init_type) => {
  return {
    type: 'INIT_START',
    init_type,
  };
};
export const simonAddTurn = () => {
  return {
    type: 'SIMON_ADD_TURN'
  };
};
const simonShowTurn = (btn_act) => {
  return {
    type: 'SIMON_SHOW_TURN_START',
    btn_active: btn_act
  };
};
const simonEndTurn = () => {
  return {
    type: 'SIMON_SHOW_TURN_END'
  };
};
const playerTurnStart = () => {
  return {
    type: 'PLAYER_TURN_START'
  };
};
function isSimonPlay(getState) {
  let state = getState().gameState;
  return (state.is_on && (state.gstate === 'simon' || state.gstate === 'init') );
}
function simonShowTurnWrp(dispatch, getState) {
  let state = getState();
  dispatch(simonShowTurn(state.gameState.moves[state.gameState.pos]));
  setTimeout(function() {
    if (isSimonPlay(getState)) {
      dispatch(simonEndTurn());
      if (state.gameState.pos+1 < state.gameState.moves.length) {
        setTimeout(function(){
          if (isSimonPlay(getState))
            simonShowTurnWrp(dispatch, getState);
        },1000);
      }
      else {
        dispatch(playerTurnStart());
      }
    }
  }, 1000);
}

function startSimonShowTurn(dispatch, getState) {

  setTimeout(function(){
    if (isSimonPlay(getState)) {
      simonShowTurnWrp(dispatch, getState);
    }
  }, 1500);
}

function startSequence(dispatch, getState, init_type) {
  dispatch(initStart(init_type));
  setTimeout(function() {
    if (getState().gameState.is_on) {
      dispatch(simonAddTurn());
      startSimonShowTurn(dispatch, getState);
    }
  }, 2500);
}

export function startGame() {
  return function(dispatch, getState) {
    if (getState().gameState.is_on ) {
      startSequence(dispatch, getState, 'start');
    }
  };
}
const playerNextTurn = () => {
  return {
    type: 'PLAYER_NEXT_TURN',
  };
};
export const bigButtonDown = (btn_id) => {
  return {
    type: 'BIG_BUTTON_DOWN',
    btn_id
  };
};
export function thunkPlayerTurn(btn_id) {
  return function(dispatch, getState) {
    let state=getState().gameState;
    if (state.moves[state.pos] === btn_id) {
      // successfull turn
      if (state.pos+1 === state.moves.length) {
        //last successfull turn
        dispatch(simonAddTurn());
        startSimonShowTurn(dispatch, getState);
      }
      else {
        dispatch(playerNextTurn());
      }
    }
    else {
      // unsuccessfull turn
      dispatch(initStart('error'));
      setTimeout(function(){
        let state=getState().gameState;
        if (state.is_on) {
          if (state.strict_on) {
            startSequence(dispatch, getState, 'start');
          }
          else {
            startSimonShowTurn(dispatch, getState);
          }
        }
      }, 2500);
    }
  };
}

export const strictButtonPress = () => {
  return {
    type: 'STRICT_BTN_PRESS'
  };
};

const genTurn = () => {
  const TURNS = ['lu', 'ru', 'ld', 'rd'];
  let min = Math.ceil(0);
  let max = Math.floor(3);
  let rand = Math.floor(Math.random() * (max - min+ 1)) + min;
  return TURNS[rand];
};

const initialState = {
  is_on: false,
  strict_on: false,
  gstate: 'stop',
  btns_enabled: false,
  count: '',
  moves: [],
  pos: 0,
  btn_active: ''
};
// reducers
// jshint ignore:start
const gameState = (state= initialState, action) => {
  simon_play_stop();
  switch (action.type) {
    case 'SWITCH_GAME':
      if (state.is_on) return { ...initialState };
      else return { ...state, is_on: !state.is_on, count:'--', btn_active:''};
    case 'SWITCH_STRICT':
      return { ...state, strict_on: state.is_on ? !state.strict_on : state.strict_on, btn_active:'' };
    case 'INIT_START':
      if (action.init_type === 'start') {
        return { ...state, is_on:true, gstate:'init', count: '--', moves:[], pos:0,
          btn_active: '', btns_enabled: false
        };
      }
      else {
        return { ...state, is_on:true, gstate:'init', count: '!!', btn_active:''};
      }
    case 'SIMON_ADD_TURN':
      return { ...state, pos:0, moves: [...state.moves, genTurn()], count:state.moves.length+1, gstate:'simon',btn_active:''};
    case 'SIMON_SHOW_TURN_START':
      return {...state, btn_active: action.btn_active, gstate:'simon', count:state.moves.length };
    case 'SIMON_SHOW_TURN_END':
      return {...state, pos:state.pos+1, btn_active: '' };
    case 'PLAYER_TURN_START':
      return {...state, pos:0, gstate:'player', btn_active:''};
    case 'PLAYER_NEXT_TURN':
      return {...state, pos:state.pos+1, btn_active:''};
    case 'BIG_BUTTON_DOWN':
      simon_play(action.btn_id);
      return {...state, btn_active: action.btn_id};
    default:
      return state;
  }
};
// jshint ignore:end
export const simonGame = combineReducers({
  gameState,
});



// store
/*let store = createStore(simonGame);


//tests
console.log(store.getState());

// Every time the state changes, log it
// Note that subscribe() returns a function for unregistering the listener
let unsubscribe = store.subscribe(() =>
  console.log(store.getState())
);

store.dispatch(gameSwitch());
store.dispatch(gameSwitch());
*/
