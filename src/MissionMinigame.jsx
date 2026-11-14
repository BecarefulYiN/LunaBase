import React, { useEffect, useRef, useState } from 'react';
import { BatteryCharging, Radio, RotateCcw, Search, Snowflake, X } from './Icons.jsx';

const DETAILS = {
  ice: { title: 'Water ice extraction', subtitle: 'Stabilize the heater, then collect a clean ice core.', Icon: Snowflake },
  sample: { title: 'Moon-rock sample', subtitle: 'Memorize the scanner sequence and repeat it to reveal the rock core.', Icon: Search },
  beacon: { title: 'Relay beacon repair', subtitle: 'Tune both signal bands to reconnect the outpost.', Icon: Radio },
};

function IceGame({ onComplete }) {
  const [needle, setNeedle] = useState(8);
  const direction = useRef(1);
  const [message, setMessage] = useState('Wait for the heat indicator to enter the green zone.');
  useEffect(() => {
    const timer = window.setInterval(() => setNeedle((value) => {
      const next = value + direction.current * 2.2;
      if (next >= 96 || next <= 4) direction.current *= -1;
      return Math.max(4, Math.min(96, next));
    }), 45);
    return () => window.clearInterval(timer);
  }, []);
  const collect = () => {
    if (needle >= 45 && needle <= 62) onComplete();
    else setMessage(needle < 45 ? 'Too cold. Let the heater warm the core a little more.' : 'Too hot. Wait for the temperature to settle back down.');
  };
  return <div className="mini-game-content"><div className="mini-game-instruction"><Snowflake size={17}/><span>Keep the thermal drill inside its safe operating range.</span></div>
    <div className="heat-meter"><div className="heat-cold"/><div className="heat-safe"/><div className="heat-hot"/><i style={{ left: `${needle}%` }}/></div><div className="heat-labels"><span>COLD</span><b>SAFE ZONE</b><span>HOT</span></div>
    <p className="mini-feedback">{message}</p><button className="mini-primary" onClick={collect}><Snowflake size={16}/> Collect ice core</button></div>;
}

function SampleGame({ onComplete }) {
  const sequence = ['blue', 'amber', 'mint', 'blue'];
  const [showPattern, setShowPattern] = useState(true);
  const [position, setPosition] = useState(0);
  const [sampleReady, setSampleReady] = useState(false);
  const [message, setMessage] = useState('Remember the scanner lights.');
  useEffect(() => {
    const timer = window.setTimeout(() => { setShowPattern(false); setMessage('Now repeat the pattern.'); }, 1800);
    return () => window.clearTimeout(timer);
  }, []);
  const choose = (color) => {
    if (color !== sequence[position]) {
      setPosition(0);
      setShowPattern(true);
      setMessage('Sequence reset. Watch the lights and try again.');
      window.setTimeout(() => { setShowPattern(false); setMessage('Now repeat the pattern.'); }, 1800);
      return;
    }
    if (position === sequence.length - 1) {
      setSampleReady(true);
      setMessage('Mineral scan matched. The moon-rock core is now in the sample tray.');
    }
    else setPosition((step) => step + 1);
  };
  return <div className="mini-game-content"><div className="mini-game-instruction"><Search size={17}/><span>{showPattern ? 'Memorize the scanner light sequence.' : 'Repeat the four lights in the same order.'}</span></div>
    <div className={`rock-sample-display ${sampleReady ? 'rock-secured' : ''}`}><div className="rock-sample-tray"><svg viewBox="0 0 100 62" role="img" aria-label={sampleReady ? 'Collected lunar rock sample' : 'Lunar rock sample target'}><ellipse cx="50" cy="51" rx="43" ry="8" fill="#141820" opacity=".55"/><path d="M18 43 23 28 34 21 39 12 52 16 60 11 70 21 82 25 85 38 76 47 60 50 43 48 29 51Z" fill={sampleReady ? '#b99b70' : '#66707a'} stroke={sampleReady ? '#f0d29b' : '#a7b0b6'} strokeWidth="2.4"/><path d="m26 29 12-7 8 5-5 9-13 1Zm22 8 8-13 11 2 5 10-8 8-13-1Zm14-17 8 2 4 8-8-1Z" fill={sampleReady ? '#d1b487' : '#838d94'} opacity=".76"/><circle cx="34" cy="41" r="2" fill="#e2c895"/><circle cx="69" cy="34" r="2.2" fill="#e2c895"/><circle cx="52" cy="24" r="1.6" fill="#f1dba9"/></svg></div><div className="rock-sample-label"><span className="sample-status-dot"/><span>{sampleReady ? 'MOON-ROCK CORE · READY TO SECURE' : 'SCANNER TARGET · ROCK CORE'}</span></div></div>
    <div className="memory-sequence" aria-label={showPattern ? 'Scanner sequence' : 'Scanner sequence hidden'}>{sequence.map((color, index) => <span className={`memory-light ${color} ${showPattern ? 'lit' : ''}`} key={`${color}-${index}`}/>)}</div>
    <p className="mini-feedback">{message} {`(${sampleReady ? sequence.length : position}/${sequence.length})`}</p>{sampleReady ? <button className="mini-primary sample-secure-button" onClick={onComplete}><Search size={16}/> Secure moon-rock sample</button> : <div className="sample-buttons">{['blue', 'amber', 'mint'].map((color) => <button className={`sample-button ${color}`} key={color} onClick={() => choose(color)} aria-label={`Select ${color} scanner light`} disabled={showPattern}><span/></button>)}</div>}</div>;
}

function BeaconGame({ onComplete }) {
  const [freq, setFreq] = useState([20, 85]);
  const [message, setMessage] = useState('Tune both dials until their signals match the target bands.');
  const targets = [45, 60];
  const tune = (index, delta) => setFreq((current) => current.map((value, i) => i === index ? Math.max(0, Math.min(100, value + delta)) : value));
  const connect = () => {
    if (freq[0] === targets[0] && freq[1] === targets[1]) onComplete();
    else setMessage('Signal is still unstable. Adjust the dials and try again.');
  };
  return <div className="mini-game-content"><div className="mini-game-instruction"><Radio size={17}/><span>Match both receiver frequencies to restore the relay.</span></div>
    <div className="signal-dials">{freq.map((value, index) => <div className="signal-dial" key={index}><div className="dial-label"><span>CHANNEL {index + 1}</span><b>{targets[index]} MHz TARGET</b></div><div className="dial-scale"><span style={{ left: `${value}%` }}>{value} <small>MHz</small></span><i style={{ left: `${value}%` }}/><b style={{ left: `${targets[index]}%` }}/></div><div className="dial-controls"><button onClick={() => tune(index, -5)} aria-label={`Lower channel ${index + 1}`}>−</button><button onClick={() => tune(index, 5)} aria-label={`Raise channel ${index + 1}`}>+</button></div></div>)}</div>
    <p className="mini-feedback">{message}</p><button className="mini-primary" onClick={connect}><BatteryCharging size={16}/> Lock signal</button></div>;
}

export default function MissionMinigame({ task, onComplete, onClose }) {
  if (!task) return null;
  const detail = DETAILS[task];
  const Icon = detail.Icon;
  const Game = task === 'ice' ? IceGame : task === 'sample' ? SampleGame : BeaconGame;
  return <div className="minigame-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="minigame-dialog" role="dialog" aria-modal="true" aria-labelledby="minigame-title"><button className="minigame-close" onClick={onClose} aria-label="Leave task"><X size={18}/></button>
      <div className={`minigame-emblem ${task}`}><Icon size={22}/></div><p className="eyebrow">FIELD TASK · LUNABASE-01</p><h2 id="minigame-title">{detail.title}</h2><p className="minigame-subtitle">{detail.subtitle}</p>
      <Game onComplete={onComplete}/><button className="mini-back" onClick={onClose}><RotateCcw size={13}/> Return to surface</button>
    </section>
  </div>;
}
