/*jshint esversion:6*/

import React from 'react';
import { connect } from 'react-redux';
import { gameSwitch, strictSwitch, thunkStartGame, thunkPlayerTurn, simon_play, bigButtonDown } from './state';

const SimonBigButton = ({type, is_on, is_active, onmouseup, onmousedown}) => {
    let cls;
    if (is_active)
      cls= `SimonBigButton SimonBigButton--${type} SimonBigButton--${type}__active`;
    else
      cls= `SimonBigButton SimonBigButton--${type}`;
    return (<button disabled={!is_on} className={cls} onMouseUp={onmouseup} onMouseDown={onmousedown}></button>);
}


const SimonPannelButton = ({btncolor, label, indstate, onClick}) => {
  let stl = {
    backgroundColor : btncolor
  };
  let cls = `SimonPannelButton__indicator SimonPannelButton__indicator--${indstate}`;
  return (
    <div className="SimonPannelButton">
      <div className={cls}></div>
      <button
        className='SimonPannelButton__btn'
        style={stl}
        onClick={onClick}>
      </button>
      <div className='SimonPannel__label'>{label}</div>
    </div>
  );
};

const SimonPannelCounter = (props) => {
  return (
    <div>
      <div className='SimonPannelCounter '>
        <div className={props.init_phase===true?'SimonPannelCounter--anim':''}>
          {props.count}
        </div>
      </div>
      <div className='SimonPannel__label'>COUNT</div>
    </div>
  );
}

const SimonPannelSwitch = ({is_on, onMainSwitch}) => {
  let cls=`SimonPannelSwitch__btn--${is_on?'on':'off'}`;
  return (
    <div className="SimonPannelSwitch">
      <div className='SimonPannel__label'>OFF</div>
      <div className='SimonPannelSwitch__btn' onClick={onMainSwitch}>
        <div className={cls}></div>
      </div>
      <div className='SimonPannel__label'>ON</div>
    </div>
  );
}

const SimonPannel = ({gameState, onMainSwitch, onStrictClick, onStartClick}) => (
  <div className='SimonPannel'>
    <div className='SimonPannelContainer'>
      <div className='SimonPannelContainer--row'>
        <div>Simon</div>
        <div style={{fontSize: 20}}>&reg;</div>
      </div>
      <div className='SimonPannelContainer--row'>
        <SimonPannelCounter count={gameState.count} init_phase={gameState.gstate==='init'}></SimonPannelCounter>
        <SimonPannelButton btncolor='red' label="START" indstate="hidden" onClick={onStartClick} />
        <SimonPannelButton
          btncolor='yellow'
          label='STRICT'
          indstate={gameState.strict_on?'on':'off'}
          onClick={onStrictClick}
        />
      </div>
      <SimonPannelSwitch is_on={gameState.is_on} onMainSwitch={onMainSwitch} />
    </div>
  </div>
)

const mapSimonPannelStateToProps = (state) => {
  return state;
}
const mapSimonPannelDispatchToProps = (dispatch) => {
  return {
    onMainSwitch: () => {
      dispatch(gameSwitch())
    },
    onStrictClick: () => {
      dispatch(strictSwitch())
    },
    onStartClick: () => {
      dispatch(thunkStartGame())
    }
  };
};
const SimonPannelContainer = connect(
  mapSimonPannelStateToProps,
  mapSimonPannelDispatchToProps
)(SimonPannel);

const SimonGame = ({gameState, onBigButton, onBigButtonDown}) => {
  if (gameState.btn_active) {
    simon_play(gameState.btn_active); //play
  }
  return (
  <div className='simon-game'>
    <SimonBigButton type="lu" is_on={gameState.gstate==='player'} is_active={gameState.btn_active === 'lu'}
      onmouseup={onBigButton.bind(this, 'lu')}
      onmousedown={onBigButtonDown.bind(this, 'lu')} />
    <SimonBigButton type="ru" is_on={gameState.gstate==='player'} is_active={gameState.btn_active === 'ru'}
      onmouseup={onBigButton.bind(this, 'ru')}
      onmousedown={onBigButtonDown.bind(this, 'ru')} />
    <SimonBigButton type="ld" is_on={gameState.gstate==='player'} is_active={gameState.btn_active === 'ld'}
      onmouseup={onBigButton.bind(this, 'ld')}
      onmousedown={onBigButtonDown.bind(this, 'ld')} />
    <SimonBigButton type="rd" is_on={gameState.gstate==='player'} is_active={gameState.btn_active === 'rd'}
      onmouseup={onBigButton.bind(this, 'rd')}
      onmousedown={onBigButtonDown.bind(this, 'rd')} />
    <SimonPannelContainer />
  </div>
  )
}

const mapStateToProps = (state) => {
  return state;
};
const mapDispatchToProps = (dispatch) => {
  return {
    onBigButton: (btn_id) => {
      dispatch(thunkPlayerTurn(btn_id))
    },
    onBigButtonDown: (btn_id) => {
      dispatch(bigButtonDown(btn_id));
    }
  };
}
const ReduxSimonGame = connect(
  mapStateToProps,
  mapDispatchToProps
)(SimonGame);

export default ReduxSimonGame;
