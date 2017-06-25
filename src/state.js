//jshint esversion: 6

import { combineReducers } from 'redux';

/* TODO :
- vitazstvo po 20 uspesnych tahoch : zobrazi ** na display a zatrubi
- zrychlovanie tahov
- po stlaceni a drzani big buttonu hra ton a zaroven svieti buton : DONE
*/

// play timeout
const winTurns = 19;
const MaxTimeout = 1000;
const MinTimeout = 300;
const simonTimouetDecrement = Math.round((MaxTimeout-MinTimeout)/(winTurns+1));
const simonTimeout = (pos) => {
  let new_t = 1000 - pos*simonTimouetDecrement;
  return new_t;
};

//audio
const simon_audio = {
  'lu': new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
  'ru': new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),
  'ld': new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'),
  'rd': new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'),
};
export const simon_play = (type) => {
  //simon_audio[type].loop = true;
  if (type==='all') {
    Object.keys(simon_audio).forEach((e)=>{simon_audio[e].play();});
  }
  else {
    simon_audio[type].play();
  }
};
export const simon_stop_play = (type) => {
  /* prepared for audio web api */
  //simon_audio[type].loop = false;
  return;
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
export const initStart = () => {
  return {
    type: 'INIT_START',
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
export const bigButtonUp = (btn_id) => {
  return {
    type: 'BIG_BUTTON_UP',
    btn_id
  };
};
export const strictButtonPress = () => {
  return {
    type: 'STRICT_BTN_PRESS'
  };
};
export const errStateOn = () => {
  return {
    type: 'ERROR_ON'
  };
};
export const errStateOff = () => {
  return {
    type: 'ERROR_OFF'
  };
};
const smileOn = () => {
  return {
    type: 'SMILE_ON'
  };
};
const setLastPlayerTimer = (start_time) => {
  return {
    type: 'SET_LAST_PLAYER_TIMER',
    start_time
  };
};


const genTurn = () => {
  const TURNS = ['lu', 'ru', 'ld', 'rd'];
  let min = Math.ceil(0);
  let max = Math.floor(3);
  let rand = Math.floor(Math.random() * (max - min+ 1)) + min;
  return TURNS[rand];
};
export function thunkStartGame() {
  return function(dispatch, getState) {
    if (getState().gameState.is_on ) {
      startSequence(dispatch, getState);
    }
  };
}
function startSequence(dispatch, getState) {
  dispatch(initStart());
  setTimeout(function() {
    if (getState().gameState.is_on) {
      dispatch(simonAddTurn());
      startSimonShowTurn(dispatch, getState);
    }
  }, 2500);
}
function startSimonShowTurn(dispatch, getState) {
  setTimeout(function(){
    if (isSimonPlay(getState)) {
      simonShowTurnWrp(dispatch, getState);
    }
  }, 1500);
}
function isSimonPlay(getState) {
  let state = getState().gameState;
  return (state.is_on && (state.gstate === 'simon' || state.gstate === 'init') );
}
function setPlayerTimer(dispatch, getState) {
  let start_time = Date.now();
  dispatch(setLastPlayerTimer(start_time));
  setTimeout(function() {
    let s = getState().gameState;
    if (s.gstate === 'player' ) {
      if (s.last_player_timer === start_time) {
        /* this timer was last */
        errorSeq(dispatch, getState);
      }
    }
  }, 5000);
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
        },simonTimeout(getState().gameState.moves.length));
      }
      else {
        setPlayerTimer(dispatch, getState);
        dispatch(playerTurnStart());
      }
    }
  }, simonTimeout(getState().gameState.moves.length));
}
//----
const errorSeq = (dispatch, getState, err_i=0) => {
  if (getState().gameState.is_on) {
    if (err_i === 2) {
      if (getState().gameState.strict_on) {
        startSequence(dispatch, getState, 'start');
      }
      else {
        startSimonShowTurn(dispatch, getState);
      }
    }
    else {
      dispatch(errStateOn());
      setTimeout(function() {
        if (getState().gameState.is_on) {
          dispatch(errStateOff());
          setTimeout(function() {
            errorSeq(dispatch, getState, err_i+1);
          }, 500);
        }
      }, 500);
    }
  }
};
const bigBtns=['lu','ru','rd','ld'];
const winSeq= (dispatch, getState, win_i=0, btn_id=0) => {
  if (getState().gameState.is_on && win_i < 4) {
    if (btn_id>0) dispatch(simonEndTurn(bigBtns[btn_id]));
    if (btn_id >= 4)
      setTimeout(winSeq.bind(this, dispatch, getState, win_i+1, 0), 200);
    else {
      dispatch(simonShowTurn(bigBtns[btn_id]));
      setTimeout(winSeq.bind(this, dispatch, getState, win_i, btn_id+1), 200);
    }
  }
  else dispatch(smileOn());
};
export function thunkPlayerTurn(btn_id) {
  return function(dispatch, getState) {
    setPlayerTimer(dispatch, getState);
    dispatch(bigButtonUp(btn_id));
    let state=getState().gameState;
    if (state.moves[state.pos] === btn_id) {
      // successfull turn
      if (state.pos+1 === state.moves.length) {
        //last successfull turn
        if (state.pos >= winTurns) {
          //player win
          winSeq(dispatch, getState, 0, 0);
        }
        else {
          dispatch(simonAddTurn());
          startSimonShowTurn(dispatch, getState);
        }
      }
      else {
        dispatch(playerNextTurn());
      }
    }
    else {
      // unsuccessfull turn
      errorSeq(dispatch, getState);
    }
  };
}


const initialState = {
  is_on: false,
  strict_on: false,
  gstate: 'stop',
  btns_enabled: false,
  count: '',
  moves: [],
  pos: 0,
  btn_active: '',
  last_player_timer: 0
};
// reducers
// jshint ignore:start
const counterState = (state = false, action) => {
  switch (action.type) {
    case 'INIT_START':
      return true;
    case 'SMILE_ON':
      return true;
    case 'ERROR_ON':
      return true;
    case 'ERROR_OFF':
      return true;
    default:
      return false;
  }
};
const gameState = (state= initialState, action) => {
  switch (action.type) {
    case 'SWITCH_GAME':
      if (state.is_on) return { ...initialState };
      else return { ...state, is_on: !state.is_on, count:'--', btn_active:''};
    case 'SWITCH_STRICT':
      if (state.is_on) {
        return {...initialState, strict_on: state.is_on ? !state.strict_on : state.strict_on,
          is_on:true, count:'--', btn_active:'', moves:[], pos:0, gstate:'init', btns_enabled:false};
      }
      else return {...state};
    case 'INIT_START':
      return { ...state, is_on:true, gstate:'init', count: '--', moves:[], pos:0,
          btn_active: '', btns_enabled: false };
    case 'ERROR_ON':
      simon_play('all');
      return {...state, btn_active:'all', gstate:'simon', pos:0, count: '!!'};
    case 'ERROR_OFF':
      simon_stop_play('all');
      return {...state, btn_active:''};
    case 'SIMON_ADD_TURN':
      return { ...state, pos:0, moves: [...state.moves, genTurn()], count:state.moves.length+1, gstate:'simon'};
    case 'SIMON_SHOW_TURN_START':
      simon_play(action.btn_active);
      return {...state, btn_active: action.btn_active, gstate:'simon', count:state.moves.length };
    case 'SIMON_SHOW_TURN_END':
      simon_stop_play(state.btn_active);
      return {...state, pos:state.pos+1, btn_active: '' };
    case 'PLAYER_TURN_START':
      return {...state, pos:0, gstate:'player'};
    case 'PLAYER_NEXT_TURN':
      return {...state, pos:state.pos+1};
    case 'BIG_BUTTON_DOWN':
      simon_play(action.btn_id);
      return {...state, btn_active: action.btn_id};
    case 'BIG_BUTTON_UP':
      simon_stop_play(action.btn_id);
      return {...state, btn_active: ''};
    case 'SMILE_ON':
      return {...state, count: ':-)'};
    case 'SET_LAST_PLAYER_TIMER':
      return {...state, last_player_timer : action.start_time};
    default:
      return state;
  }
};
// jshint ignore:end
export const simonGame = combineReducers({
  gameState,
  counterState
});
