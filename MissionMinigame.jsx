import { createScannerSequence, createSignalChallenge, createIceChallenge, createSolarChallenge, createWaterChallenge } from './missionChallenges.js';
import React, { useEffect, useRef, useState } from 'react';
import { BatteryCharging, ChevronRight, Droplets, Footprints, Radio, RotateCcw, Search, Snowflake, Sun, X } from './Icons.jsx';

const DETAILS = {
  purifyWater: { title: 'Water recovery cycle', subtitle: 'Match each contaminant with the right filter.', Icon: Droplets, steps: ['Read the contaminant shown on the sample.', 'Choose the filter media that removes it.', 'Clear three samples to finish purification.'] },
  chargePower: { title: 'Solar array circuit', subtitle: 'Rotate the power couplers to route sunlight into the battery.', Icon: Sun, steps: ['Click the couplers to rotate them.', 'Connect the incoming solar line through all couplers.', 'Power reaches storage when the circuit is complete.'] },
  ice: { title: 'Water ice extraction', subtitle: 'Stabilize the heater, then collect a clean ice core.', Icon: Snowflake, steps: ['Watch the temperature needle sweep across the meter.', 'Click Collect ice core when the needle enters the green SAFE ZONE.', 'Too early or too late? Wait for the next pass and try again.'] },
  sample: { title: 'Moon-rock sample', subtitle: 'Memorize the scanner sequence and repeat it to reveal the rock core.', Icon: Search, steps: ['Watch the four scanner lights in order.', 'After they go dark, tap the matching colors in the same order.', 'When the rock appears in the tray, secure the sample to finish.'] },
  beacon: { title: 'Relay beacon repair', subtitle: 'Tune both signal bands to reconnect the outpost.', Icon: Radio, steps: ['Use − and + to adjust Channel 1 and Channel 2.', 'Match each dial to its target frequency number.', 'Press Lock signal when both channels line up.'] },
};

function TutorialVisual({ task }) {
  if (task === 'purifyWater') return <div className="tutorial-stage tutorial-water"><div className="tutorial-stage-caption">WATER LAB · MATCH POLLUTANT TO FILTER</div><div className="tutorial-flashes"><i>GRIT</i><i>OIL</i><i>SALT</i></div><div className="tutorial-zone-label">SAND · CARBON · MEMBRANE</div></div>;
  if (task === 'chargePower') return <div className="tutorial-stage tutorial-solar"><div className="tutorial-stage-caption">SOLAR ARRAY · CONNECT THE CIRCUIT</div><div className="tutorial-flashes"><i>☀</i><i>↻</i><i>▣</i></div><div className="tutorial-zone-label">ROTATE COUPLERS TO REACH BATTERY</div></div>;
  if (task === 'ice') return <div className="tutorial-stage tutorial-ice"><div className="tutorial-stage-caption">THERMAL DRILL · WATCH THE NEEDLE</div><div className="tutorial-heat"><span/><i/></div><div className="tutorial-zone-label">← WAIT FOR THE GREEN SAFE ZONE →</div></div>;
  if (task === 'sample') return <div className="tutorial-stage tutorial-sample"><div className="tutorial-stage-caption">SCAN · REMEMBER · REPEAT</div><div className="tutorial-flashes"><i/><i/><i/><i/></div><div className="tutorial-rock">◆</div><div className="tutorial-zone-label">LIGHTS REVEAL THE ROCK CORE</div></div>;
  return <div className="tutorial-stage tutorial-beacon"><div className="tutorial-stage-caption">SIGNAL RELAY · MATCH BOTH CHANNELS</div>{[1, 2].map((channel) => <div className="tutorial-dial" key={channel}><span>CH {channel}</span><div><i/></div><b>TARGET</b></div>)}<div className="tutorial-zone-label">− / + TUNE &nbsp; · &nbsp; LOCK SIGNAL</div></div>;
}

function IceGame({ onComplete }) {
  const [challenge] = useState(() => createIceChallenge());
  const [slow, setSlow] = useState(false);
  const [needle, setNeedle] = useState(8);
  const direction = useRef(1);
  const [lastAttempt, setLastAttempt] = useState(null);
  const inSafeZone = needle >= challenge.min && needle <= challenge.max;
  useEffect(() => {
    const timer = window.setInterval(() => setNeedle((value) => {
      const next = value + direction.current * challenge.speed * (slow ? 0.5 : 1);
      if (next >= 96 || next <= 4) direction.current *= -1;
      return Math.max(4, Math.min(96, next));
    }), 65);
    return () => window.clearInterval(timer);
  }, [challenge, slow]);
  const collect = () => {
    if (inSafeZone) onComplete();
    else setLastAttempt(needle < challenge.min ? 'cold' : 'hot');
  };
  const status = inSafeZone ? 'Perfect window — collect now!' : needle < challenge.min ? 'Warming up · wait for the green zone.' : 'Cooling down · watch for the green zone.';
  const message = inSafeZone ? status : lastAttempt === 'cold' ? 'That was a little early. The needle is still moving — try again in the green zone.' : lastAttempt === 'hot' ? 'That was a little late. Watch the needle come back around.' : status;
  return <div className="mini-game-content"><div className="mini-game-instruction"><Snowflake size={17}/><span>Tap <b>Collect ice core</b> while the moving needle is in the green SAFE ZONE.</span></div>
    <div className={`ice-readout ${inSafeZone ? 'ice-readout-ready' : ''}`}><span>DRILL CONTROL (GAME SCALE)</span><b>{Math.round(needle)} / 100</b><strong>{inSafeZone ? 'READY' : needle < challenge.min ? 'WARMING' : 'COOLING'}</strong></div>
    <div className={`heat-meter ${inSafeZone ? 'heat-ready' : ''}`} style={{background: `linear-gradient(90deg, #4d91b2 0%, #4d91b2 ${challenge.min}%, #72cba2 ${challenge.min}%, #72cba2 ${challenge.max}%, #bd6869 ${challenge.max}%, #bd6869 100%)`}}><div className="heat-cold"/><div className="heat-safe" style={{left: `${challenge.min}%`, right: `${100-challenge.max}%`}}/><div className="heat-hot"/><i style={{ left: `${needle}%` }}/></div><div className="heat-labels"><span>COLD</span><b>SAFE ZONE</b><span>HOT</span></div>
    <button className="mini-back" aria-pressed={slow} onClick={() => setSlow(value => !value)}>{slow ? 'Slow mode on — use normal speed' : 'Need more time? Use slow mode'}</button><p className={`mini-feedback ${inSafeZone ? 'mini-feedback-ready' : ''}`} aria-live="polite">{message}</p><button className={`mini-primary ${inSafeZone ? 'ice-collect-ready' : ''}`} onClick={collect}><Snowflake size={16}/> {inSafeZone ? 'Collect ice core now' : 'Collect ice core'}</button></div>;
}

function WaterFilterGame({ onComplete }) {
  const [challenge] = useState(() => createWaterChallenge());
  const { samples, choices } = challenge;
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(false);
  const [message, setMessage] = useState('Select the treatment suited to this contaminant.');
  const finished = useRef(false);
  const choose = filter => {
    if (correct) return;
    if(filter !== samples[round].answer){ setMessage('Try another treatment. Look at what each option removes.'); return; }
    setCorrect(true); setMessage(samples[round].explanation);
  };
  const next = () => {
    if(!correct || finished.current) return;
    if(round === samples.length-1){ finished.current=true; onComplete(); }
    else {setRound(value=>value+1);setCorrect(false);setMessage('Inspect the next sample and select its treatment.');}
  };
  return <div className="mini-game-content"><div className="mini-game-instruction"><Droplets size={17}/><span>Sample {round+1}/{samples.length} — Contaminant: <b>{samples[round].dirt}</b></span></div><div className="filter-choices">{choices.map(([id,name,desc])=><button key={id} disabled={correct} onClick={()=>choose(id)}><Droplets size={18}/><b>{name}</b><small>{desc}</small></button>)}</div><p className="mini-feedback" aria-live="polite">{message}</p>{correct&&<button className="mini-primary" onClick={next}>{round===samples.length-1?'Finish calibration':'Next sample'}</button>}<small>Simplified treatment-matching exercise, not a complete drinking-water treatment procedure.</small></div>;
}

function SolarCircuitGame({ onComplete }) {
  const [rotations, setRotations] = useState(() => createSolarChallenge());
  const aligned = rotations.filter((value) => value % 2 === 0).length;
  const rotate = (index) => {
    const next = rotations.map((value, i) => i === index ? (value + 1) % 4 : value);
    setRotations(next);
    if (next.every((value) => value % 2 === 0)) onComplete();
  };
  return <div className="mini-game-content"><div className="mini-game-instruction"><Sun size={17}/><span>Turn each coupler to make its line horizontal and link the solar array to the battery.</span></div><div className="solar-circuit"><span className="solar-source">☀ SOLAR</span>{rotations.map((value, i) => <button key={i} onClick={() => rotate(i)} aria-label={`Coupler ${i + 1}: ${value % 2 ? 'vertical' : 'horizontal'}. Click to rotate`}><i className={value % 2 ? 'pipe-vertical' : 'pipe-horizontal'}/><small>{i + 1}</small></button>)}<span className="battery-target">▣ BATTERY</span></div><div className="solar-target"><span>REQUIRED PATH</span><b>← ━ ━ ━ →</b></div><p className="mini-feedback" aria-live="polite">{aligned}/3 couplers connected horizontally. Click a tile to rotate it.</p></div>;
}

function SampleGame({ onComplete }) {
  const [sequence] = useState(() => createScannerSequence());
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
  const [challenge] = useState(() => createSignalChallenge());
  const [freq, setFreq] = useState(challenge.initial);
  const [message, setMessage] = useState('Tune both dials until their signals match the target bands.');
  const targets = challenge.targets;
  const tune = (index, delta) => setFreq((current) => current.map((value, i) => i === index ? Math.max(0, Math.min(100, value + delta)) : value));
  const connect = () => {
    if (freq[0] === targets[0] && freq[1] === targets[1]) onComplete();
    else setMessage('Signal is still unstable. Adjust the dials and try again.');
  };
  return <div className="mini-game-content"><div className="mini-game-instruction"><Radio size={17}/><span>Match both target frequencies to calibrate the relay. Targets change each mission. These are game values.</span></div>
    <div className="signal-dials">{freq.map((value, index) => <div className="signal-dial" key={index}><div className="dial-label"><span>CHANNEL {index + 1}</span><b>{targets[index]} MHz TARGET</b></div><div className="dial-scale"><span style={{ left: `${value}%` }}>{value} <small>MHz</small></span><i style={{ left: `${value}%` }}/><b style={{ left: `${targets[index]}%` }}/></div><div className="dial-controls"><button onClick={() => tune(index, -5)} aria-label={`Lower channel ${index + 1}`}>−</button><button onClick={() => tune(index, 5)} aria-label={`Raise channel ${index + 1}`}>+</button></div></div>)}</div>
    <p className="mini-feedback">{message}</p><button className="mini-primary" onClick={connect}><BatteryCharging size={16}/> Lock signal</button></div>;
}

export default function MissionMinigame({ task, onComplete, onClose }) {
  const [started, setStarted] = useState(false);
  const completed = useRef(false);
  const completeOnce = () => { if (completed.current) return; completed.current = true; onComplete(); };
  if (!task) return null;
  const detail = DETAILS[task];
  const baseTask = task === 'purifyWater' || task === 'chargePower';
  const Icon = detail.Icon;
  const Game = task === 'ice' ? IceGame : task === 'sample' ? SampleGame : task === 'beacon' ? BeaconGame : task === 'purifyWater' ? WaterFilterGame : SolarCircuitGame;
  return <div className="minigame-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="minigame-dialog" role="dialog" aria-modal="true" aria-labelledby="minigame-title"><button className="minigame-close" onClick={onClose} aria-label="Leave task"><X size={18}/></button>
      <div className={`minigame-emblem ${task}`}><Icon size={22}/></div><p className="eyebrow">{baseTask ? 'HABITAT SYSTEM · LUNABASE-01' : 'FIELD TASK · LUNABASE-01'}</p><h2 id="minigame-title">{detail.title}</h2><p className="minigame-subtitle">{detail.subtitle}</p>{!baseTask && <div className="task-stamina-cost"><Footprints size={14}/> −1 stamina when this task is completed <b>·</b> <strong>5 PER DAY</strong></div>}
      {started ? <Game task={task} onComplete={completeOnce}/> : <div className="task-tutorial"><TutorialVisual task={task}/><div className="tutorial-copy"><h3>How to complete this task</h3><ol>{detail.steps.map((step) => <li key={step}>{step}</li>)}</ol></div><button className="mini-primary tutorial-start" onClick={() => setStarted(true)}>Start mini-game <ChevronRight size={17}/></button></div>}
      <button className="mini-back" onClick={onClose}><RotateCcw size={13}/> {baseTask ? 'Return to habitat' : 'Return to surface'}</button>
    </section>
  </div>;
}
