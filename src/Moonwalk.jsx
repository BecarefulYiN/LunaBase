import React, { useEffect, useRef, useState } from 'react';
import { Compass, Footprints, Orbit, Radio, Search, Snowflake } from './Icons.jsx';

const SITES = [
  { id: 'ice', name: 'Ice prospect', hint: 'Inspect the shadowed crater', x: 76, y: 30, icon: Snowflake, tone: 'ice' },
  { id: 'sample', name: 'Rock sample', hint: 'Collect a surface sample', x: 34, y: 38, icon: Search, tone: 'sample' },
  { id: 'beacon', name: 'Signal beacon', hint: 'Check the relay signal', x: 64, y: 75, icon: Radio, tone: 'beacon' },
];

const DIRECTIONS = {
  ArrowUp: [0, -4, 'up'], w: [0, -4, 'up'], W: [0, -4, 'up'],
  ArrowDown: [0, 4, 'down'], s: [0, 4, 'down'], S: [0, 4, 'down'],
  ArrowLeft: [-4, 0, 'left'], a: [-4, 0, 'left'], A: [-4, 0, 'left'],
  ArrowRight: [4, 0, 'right'], d: [4, 0, 'right'], D: [4, 0, 'right'],
};

export default function Moonwalk({ day, foundSites, onInteract, onEnterBase, suitOxygen = 100, onStep, disabled = false, guideBase = false, guideTaskTitle = '', guideSiteId = null }) {
  const [walker, setWalker] = useState({ x: 19, y: 59, facing: 'right', step: 0 });
  const walkerRef = useRef(walker);
  const move = (direction) => {
    if (disabled || suitOxygen <= 0) return;
    const [dx, dy, facing] = DIRECTIONS[direction];
    const old = walkerRef.current;
    const next = { x: Math.max(6, Math.min(94, old.x + dx)), y: Math.max(16, Math.min(84, old.y + dy)), facing, step: old.step + 1 };
    if (next.x === old.x && next.y === old.y) return;
    onStep?.();
    walkerRef.current = next;
    setWalker(next);
  };
  const nearestSite = () => SITES
    .map((site) => ({ ...site, distance: Math.hypot(site.x - walkerRef.current.x, site.y - walkerRef.current.y) }))
    .filter((site) => !foundSites[site.id] && site.distance < 14)
    .sort((a, b) => a.distance - b.distance)[0];
  const nearBase = Math.hypot(walker.x - 15, walker.y - 35) < 20;
  const interact = () => {
    const site = nearestSite();
    if (site && suitOxygen >= 12) onInteract(site.id);
  };

  useEffect(() => {
    const handleKey = (event) => {
      if (disabled) return;
      if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'BUTTON'].includes(event.target.tagName)) return;
      if ((event.key === 'r' || event.key === 'R') && nearBase) {
        event.preventDefault();
        onEnterBase?.();
        return;
      }
      if (DIRECTIONS[event.key]) {
        event.preventDefault();
        move(event.key);
      } else if (event.key === 'e' || event.key === 'E' || event.key === ' ') {
        event.preventDefault();
        interact();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [disabled, nearBase, onEnterBase, onInteract]);

  const near = nearestSite();
  const foundCount = Object.values(foundSites).filter(Boolean).length;
  const firstDaysTargets = ['beacon', 'sample', 'ice'];
  const guideTaskId = guideSiteId || (day >= 1 && day <= firstDaysTargets.length ? firstDaysTargets[day - 1] : null);
  const guideSite = guideTaskId && !foundSites[guideTaskId] ? SITES.find((site) => site.id === guideTaskId) : null;
  const guideHome = guideBase && !guideSite ? { x: 15, y: 35 } : null;
  const guideTarget = guideSite || guideHome;
  const guideArrived = Boolean(guideSite ? near?.id === guideSite.id : guideHome && nearBase);
  return <section className="moonwalk panel" aria-label="Lunar surface exploration game">
    <div className="moonwalk-header">
      <div><p className="eyebrow">SURFACE EXPLORATION · SOL {String(day).padStart(2, '0')}</p><h2>Moonwalk</h2><p className="moonwalk-subtitle">Step out of the habitat and explore the lunar terrain.</p></div>
      <div className="field-progress"><span className="field-progress-icon"><Compass size={16}/></span><span><b>{foundCount} / 3</b><small>FIELD OBJECTIVES</small></span></div>
    </div>
    {suitOxygen <= 20 && <div className={`suit-oxygen-alert ${suitOxygen <= 8 ? 'oxygen-critical' : ''}`} role="status"><Footprints size={17}/><span><b>{suitOxygen <= 8 ? 'Suit oxygen critical' : 'Suit oxygen low'}</b><small>{suitOxygen <= 8 ? 'Return now. At 0%, you will be moved back to the habitat.' : 'Head back to the habitat soon to refill before exploring further.'}</small></span><button onClick={onEnterBase} disabled={disabled}>R · Return to base</button></div>}
    <div className="moon-world" onClick={() => document.activeElement?.blur()}>
      <div className="world-stars">·　　✦　　　　　　·　　　✧　　　　·　　✦　　　　·</div>
      <div className="world-earth"><i/></div><div className="world-ridge ridge-one"/><div className="world-ridge ridge-two"/>
      <div className="world-ground"><span className="crater crater-one"/><span className="crater crater-two"/><span className="crater crater-three"/><span className="ground-glow"/></div>
      {guideTarget&&<><svg className="mission-guide-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="mission-guide-arrow" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z"/></marker></defs><path className="mission-guide-route-shadow" d={`M ${walker.x} ${walker.y} L ${guideTarget.x} ${guideTarget.y}`}/><path className="mission-guide-route-line" d={`M ${walker.x} ${walker.y} L ${guideTarget.x} ${guideTarget.y}`} markerEnd="url(#mission-guide-arrow)"/></svg><div className={`mission-guide-card ${guideArrived?'guide-arrived':''}`}><span className="mission-guide-icon">{guideArrived?'✓':'➜'}</span><div><small>DAY {day} · MISSION GUIDE</small><b>{guideSite?(guideArrived?'You found it! Press E':`Follow the glowing path to ${guideSite.name}`):(guideArrived?'At the habitat! Press R to enter':`Follow the glowing path back to base`)}</b><i>{guideSite?(guideArrived?'Press E to begin today’s task.':'Move with WASD or arrows to follow the light.'):(guideArrived?`Enter the base to ${guideTaskTitle.toLowerCase()}.`:`Then go inside to ${guideTaskTitle.toLowerCase()}.`)}</i></div></div></>}
      <div className={`world-base ${nearBase ? 'base-nearby' : ''} ${guideHome?'base-guide-target':''}`}><span className="base-dome"/><span className="base-module"/><span className="base-window"/><span className="base-lamp"/><small>HAB 01</small>{nearBase && <button className="base-entry-button" onClick={(event) => { event.stopPropagation(); onEnterBase?.(); }} disabled={disabled}><Orbit size={15}/><span>R · Enter base</span></button>}</div>
      <div className="world-solar-field" role="img" aria-label="Solar panel array powering the lunar habitat"><div className="world-solar-panel"><i/><i/><i/><i/><i/><i/><i/><i/></div><span className="solar-support"/><span className="solar-field-label">SOLAR ARRAY</span><span className="solar-glint"/></div>
      <div className="world-rover"><span/><i/><b/></div>
      <div className="world-flag"><span/><i/></div>
      {SITES.map((site) => { const Icon = site.icon; const done = foundSites[site.id]; const isNear = near?.id === site.id; const isGuideTarget=guideSite?.id===site.id; return <div className={`world-site ${site.tone} ${done ? 'site-done' : ''} ${isNear ? 'site-near' : ''} ${isGuideTarget?'site-guide-target':''}`} key={site.id} style={{ left: `${site.x}%`, top: `${site.y}%` }}>
        <span className="site-pin"><Icon size={16}/>{done && <b>✓</b>}</span><span className="site-label">{done ? 'COMPLETE' : site.name.toUpperCase()}</span>{isNear && <span className="site-prompt">E</span>}
      </div>; })}
      <div className={`astronaut facing-${walker.facing}`} style={{ left: `${walker.x}%`, top: `${walker.y}%` }} aria-label="Your astronaut">
        <span className={`astronaut-body ${walker.step % 2 ? 'step-a' : 'step-b'}`}><i className="astronaut-pack"/><i className="astronaut-helmet"><b/></i><i className="astronaut-suit"/><i className="astronaut-arm arm-left"/><i className="astronaut-arm arm-right"/><i className="astronaut-leg leg-left"/><i className="astronaut-leg leg-right"/></span>
        <span className="astronaut-shadow"/><span className="astronaut-name">MAYA · YOU</span>
      </div>
      <div className="world-coordinate">LUNAR SOUTH POLE <span>·</span> 86.4° S</div>
      <div className="dpad" aria-label="Movement controls"><button onClick={() => move('ArrowUp')} aria-label="Move up">▲</button><button onClick={() => move('ArrowLeft')} aria-label="Move left">◀</button><button onClick={() => move('ArrowDown')} aria-label="Move down">▼</button><button onClick={() => move('ArrowRight')} aria-label="Move right">▶</button></div>
      <div className="world-controls"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> OR <kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd> MOVE</span><span><kbd>E</kbd> INTERACT</span><span><kbd>R</kbd> NEAR BASE</span><span className="suit-oxygen-world">SUIT O₂ {Math.round(suitOxygen)}%</span></div>
    </div>
    <div className="moonwalk-footer"><div className={`walk-status ${suitOxygen <= 20 ? 'walk-warning' : ''}`}><Footprints size={16}/><span>{suitOxygen <= 0 ? 'Suit oxygen empty — return to base and refill.' : suitOxygen <= 20 ? 'Suit oxygen low — return to base to refill.' : near ? `Nearby: ${near.name}` : 'Walk close to a glowing marker to investigate.'}</span></div><button className="interact-button" onClick={interact} disabled={!near || suitOxygen < 12}><span> E </span>{suitOxygen < 12 ? 'Suit oxygen too low' : near ? `Investigate ${near.name}` : 'No objective nearby'}</button></div>
  </section>;
}
