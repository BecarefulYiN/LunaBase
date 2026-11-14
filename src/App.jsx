import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, BatteryCharging, Check, ChevronRight, CircleHelp, Clock3, Compass, Droplets, Footprints, Gauge, HeartPulse, Leaf, Menu, Moon, Orbit, Package, Play, RotateCcw, Shield, Sparkles, Sun, Wind, Wrench, X } from './Icons.jsx';
import { INITIAL_GAME, takeAction } from './game.js';
import Moonwalk from './Moonwalk.jsx';
import MissionMinigame from './MissionMinigame.jsx';

const format = (value) => `${Math.round(value)}%`;

function Meter({ value, color = 'mint', label }) {
  return <div className="meter" aria-label={`${label}: ${format(value)}`}><span className={color} style={{ width: `${value}%` }} /></div>;
}

function MetricCard({ icon: Icon, label, value, unit = 'units', change, color, note }) {
  const low = value < 25;
  return <article className={`metric-card ${low ? 'metric-low' : ''}`}>
    <div className="metric-top"><span className={`metric-icon ${color}`}><Icon size={17} /></span><span className="metric-label">{label}</span><span className="metric-change">{change.startsWith('+') ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{change}</span></div>
    <div className="metric-value">{Math.round(value)}<span>{unit}</span></div>
    <div className="metric-note">{note}</div>
  </article>;
}

function HabitatArt() {
  return <div className="habitat-art" role="img" aria-label="Illustration of a lunar base, solar panels, mountains and Earth">
    <div className="earth"><span /></div><div className="art-stars">✦　　 ·　　✧　　　 ·　　✦　　·</div>
    <div className="mountain mountain-back" /><div className="mountain mountain-front" />
    <div className="moon-ground" />
    <div className="habitat"><div className="habitat-window"/><div className="habitat-door"/><div className="habitat-roof"/><div className="habitat-label">HAB 01</div></div>
    <div className="module module-left"><span/><span/></div><div className="module module-right"><span/><span/></div>
    <div className="solar-array array-left"><i/><i/><i/><i/></div><div className="solar-array array-right"><i/><i/><i/><i/></div>
    <div className="antenna"><span/></div><div className="art-caption"><span className="live-dot"/> SOUTH POLE OUTPOST <b>·</b> 86.4°S</div>
  </div>;
}

function CrewCard({ crew }) {
  return <section className="panel crew-panel">
    <div className="panel-heading"><div><p className="eyebrow">THE PEOPLE BEHIND THE MISSION</p><h2>Crew wellbeing</h2></div><span className="crew-count"><span className="live-dot" /> {crew.length} ACTIVE</span></div>
    <div className="crew-list">{crew.map((person, index) => <div className="crew-row" key={person.name}>
      <div className={`avatar avatar-${person.color}`}>{person.name.split(' ').map((part) => part[0]).join('')}</div>
      <div className="crew-name"><strong>{person.name}</strong><span>{person.role}</span></div>
      <div className="crew-stat"><span><HeartPulse size={13} /> Health</span><div className="crew-meter"><Meter value={person.health} color={person.health < 35 ? 'rose' : 'mint'} label="Health" /></div><b className={person.health < 35 ? 'text-rose' : ''}>{format(person.health)}</b></div>
      <div className="crew-stat morale"><span><Sparkles size={13} /> Morale</span><div className="crew-meter"><Meter value={person.morale} color={person.morale < 35 ? 'rose' : 'amber'} label="Morale" /></div><b className={person.morale < 35 ? 'text-rose' : ''}>{format(person.morale)}</b></div>
      <div className={`crew-state ${person.health < 35 || person.morale < 30 ? 'state-low' : ''}`}>{person.health < 35 ? 'Needs care' : person.morale < 30 ? 'Stressed' : 'Stable'}</div>
    </div>)}</div>
    <div className="crew-tip"><HeartPulse size={15} /><span>Rest boosts health and morale. Long days and low supplies wear the crew down.</span></div>
  </section>;
}

const systemsList = [
  { key: 'water', title: 'Water recovery', caption: 'Greywater & filtration', icon: Droplets, color: 'blue' },
  { key: 'air', title: 'Air purification', caption: 'Cabin air quality', icon: Wind, color: 'mint' },
  { key: 'oxygen', title: 'Oxygen generation', caption: 'Electrolysis output', icon: Orbit, color: 'violet' },
];

function SystemPanel({ systems }) {
  return <section className="panel systems-panel">
    <div className="panel-heading"><div><p className="eyebrow">LIFE SUPPORT NETWORK</p><h2>Systems status</h2></div><button className="icon-button" aria-label="Illustrative system assumptions"><CircleHelp size={16} /></button></div>
    {systemsList.map((system) => { const Icon = system.icon; const value = systems[system.key]; return <div className="system-row" key={system.key}>
      <span className={`system-icon ${system.color}`}><Icon size={17}/></span><div className="system-info"><strong>{system.title}</strong><span>{system.caption}</span></div><div className="system-readout"><b>{format(value)}</b><Meter value={value} color={value < 30 ? 'rose' : system.color} label={system.title} /></div>
    </div>; })}
    <div className="wear-card"><div className="wear-icon"><Wrench size={16}/></div><div className="wear-main"><div><span>Equipment wear</span><b>{format(systems.wear)}</b></div><Meter value={systems.wear} color={systems.wear > 65 ? 'rose' : 'amber'} label="Equipment wear"/><small>Higher wear increases system breakdown risk.</small></div><span className="wear-tag">{systems.wear > 65 ? 'SERVICE' : systems.wear > 35 ? 'WATCH' : 'GOOD'}</span></div>
  </section>;
}

function Timeline({ log }) {
  return <section className="panel timeline-panel"><div className="panel-heading"><div><p className="eyebrow">FLIGHT DIRECTOR'S LOG</p><h2>Mission timeline</h2></div><span className="log-count">LATEST {log.length}</span></div><div className="timeline">{log.map((entry, i) => <div className={`log-entry log-${entry.tone}`} key={`${entry.day}-${entry.title}-${i}`}><span className="log-dot"/><div><div className="log-title"><b>{entry.title}</b><time>DAY {String(entry.day).padStart(2, '0')}</time></div><p>{entry.detail}</p></div></div>)}</div></section>;
}

function Actions({ onAction, ended }) {
  return <section className="panel actions-panel"><div className="panel-heading"><div><p className="eyebrow">COMMAND DECK</p><h2>Choose today's focus</h2></div><span className="turn-label"><Clock3 size={13}/> CREW COMMANDS</span></div>
    <div className="action-grid">
      <button className="action-card action-primary" onClick={() => onAction('advance')} disabled={ended}><span className="action-icon"><Play size={17} fill="currentColor"/></span><span className="action-copy"><b>Advance one day</b><small>Run life-support & crew simulation</small></span><ChevronRight size={17}/></button>
      <button className="action-card" onClick={() => onAction('survey')} disabled={ended}><span className="action-icon survey-icon"><Moon size={17}/></span><span className="action-copy"><b>Surface survey</b><small>−10 power · boost crew morale</small></span><ChevronRight size={17}/></button>
      <button className="action-card" onClick={() => onAction('rest')} disabled={ended}><span className="action-icon rest-icon"><HeartPulse size={17}/></span><span className="action-copy"><b>Crew recovery</b><small>Improve health & psychological wellbeing</small></span><ChevronRight size={17}/></button>
      <button className="action-card" onClick={() => onAction('repair')} disabled={ended}><span className="action-icon repair-icon"><Wrench size={17}/></span><span className="action-copy"><b>Service equipment</b><small>−8 power · reduce equipment wear</small></span><ChevronRight size={17}/></button>
      <button className="action-card" onClick={() => onAction('ration')} disabled={ended}><span className="action-icon ration-icon"><Package size={17}/></span><span className="action-copy"><b>Reorganize provisions</b><small>+8 food · morale decreases slightly</small></span><ChevronRight size={17}/></button>
    </div>
    <div className="action-hint"><Shield size={14}/><span>Game assumption: action effects are simplified for this prototype.</span></div>
  </section>;
}

function MissionResult({ outcome, onRestart }) {
  if (!outcome) return null;
  const success = outcome === 'won';
  return <div className="result-backdrop"><div className="result-modal"><div className={`result-icon ${success ? 'result-success' : 'result-failure'}`}>{success ? <Check size={26}/> : <X size={26}/>}</div><p className="eyebrow">LUNABASE · MISSION DEBRIEF</p><h2>{success ? 'Mission accomplished' : 'Mission ended'}</h2><p>{success ? 'The crew completed all 30 days on the lunar surface. A thoughtful balance of supplies, systems, and crew care brought everyone home.' : 'A critical supply or crew health reached zero. Review the timeline, choose a different strategy, and launch again.'}</p><button className="launch-button" onClick={onRestart}><RotateCcw size={16}/> Start a new mission</button></div></div>;
}

export default function App() {
  const [game, setGame] = useState(INITIAL_GAME);
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const restart = () => { setGame(structuredClone(INITIAL_GAME)); setBriefingOpen(true); };
  const advanceDay = () => setGame((current) => takeAction(current, 'advance'));
  const rationFood = () => setGame((current) => takeAction(current, 'ration'));
  const inspectSite = (site) => { if (!game.exploration[site]) setActiveTask(site); };
  const completeSite = (site) => {
    setGame((current) => {
    if (current.exploration[site]) return current;
    const next = structuredClone(current);
    next.exploration[site] = true;
    next.stamina = Math.max(0, current.stamina - 25);
    const rewards = {
      ice: { title: 'Ice deposit surveyed', detail: 'A promising ice reading was logged. Water stores and oxygen generation prospects improved.', apply: () => { next.resources.water = Math.min(100, next.resources.water + 14); next.systems.oxygen = Math.min(100, next.systems.oxygen + 4); } },
      sample: { title: 'Lunar sample collected', detail: 'The crew collected a rock sample. The field discovery lifted morale.', apply: () => next.crew.forEach((person) => { person.morale = Math.min(100, person.morale + 6); }) },
      beacon: { title: 'Relay beacon checked', detail: 'The surface relay is working. The crew recovered a small amount of usable power.', apply: () => { next.resources.power = Math.min(100, next.resources.power + 10); } },
    };
    const reward = rewards[site];
    reward.apply();
    next.log = [{ day: next.day, title: reward.title, detail: reward.detail, tone: 'good' }, ...next.log].slice(0, 5);
    return next;
    });
    setActiveTask(null);
  };
  const tasks = [
    { id: 'ice', title: 'Survey lunar water ice', note: 'Find a local water source' },
    { id: 'sample', title: 'Collect a moon-rock sample', note: 'Bring a sample back to base' },
    { id: 'beacon', title: 'Restore the relay beacon', note: 'Check the surface signal' },
  ];
  const completed = Object.values(game.exploration).filter(Boolean).length;
  return <div className="game-shell">
    <header className="game-topbar"><a className="brand" href="#top" aria-label="LunaBase home"><span className="brand-mark"><Moon size={20}/><span/></span><span className="brand-word">luna<span>base</span><small>MOON EXPEDITION</small></span></a><div className="game-day"><span className="live-dot"/> SOL {String(game.day).padStart(2, '0')} <i>/</i> 30</div><div className="resource-strip"><div><Orbit size={15}/><span>O₂</span><b>{Math.round(game.resources.oxygen)}</b></div><div><Droplets size={15}/><span>H₂O</span><b>{Math.round(game.resources.water)}</b></div><div><BatteryCharging size={15}/><span>POWER</span><b>{Math.round(game.resources.power)}</b></div><div><Leaf size={15}/><span>FOOD</span><b>{Math.round(game.resources.food)}</b></div><div className="stamina-resource" title="Crew stamina out of 100"><Footprints size={15}/><span>STA</span><b>{game.stamina}</b><i><span style={{ width: `${game.stamina}%` }}/></i></div></div><button className="game-restart" onClick={restart}><RotateCcw size={14}/> Restart</button></header>
    <main className="game-layout" id="top">
      <section className="game-view"><Moonwalk day={game.day} foundSites={game.exploration} onInteract={inspectSite} disabled={Boolean(activeTask || briefingOpen)}/><div className="game-message"><span className="live-dot"/><span>{game.log[0]?.title}</span><i>{game.log[0]?.detail}</i></div></section>
      <aside className="game-sidebar">
        <section className="game-info-card"><div className="game-card-heading"><span className="info-sigil"><Wind size={17}/></span><div><small>HABITAT LIFE SUPPORT</small><h2>ECLSS info</h2></div></div><p className="eclss-lead">ECLSS keeps the crew alive by recycling and managing the habitat’s essential resources.</p>
          <div className="eclss-row"><span className="eclss-icon water"><Droplets size={15}/></span><div><b>Water</b><small>Recover used water; lunar ice can replenish reserves.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon oxygen"><Orbit size={15}/></span><div><b>Oxygen</b><small>Generate breathable oxygen from processed water.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon air"><Wind size={15}/></span><div><b>Clean air</b><small>Filter cabin air and remove contaminants.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon power"><BatteryCharging size={15}/></span><div><b>Power</b><small>Run recovery, filtration, lights and equipment.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon food"><Leaf size={15}/></span><div><b>Food</b><small>Keep the crew supplied throughout the mission.</small></div></div>
        </section>
        <section className="task-card"><div className="task-heading"><div><small>MISSION OBJECTIVES</small><h2>Task list</h2></div><span>{completed}/{tasks.length}</span></div><div className="task-progress"><span style={{ width: `${completed / tasks.length * 100}%` }}/></div>{tasks.map((task, index) => <div className={`task-item ${game.exploration[task.id] ? 'task-complete' : ''}`} key={task.id}><span className="task-check">{game.exploration[task.id] ? '✓' : String(index + 1).padStart(2, '0')}</span><div><b>{task.title}</b><small>{game.exploration[task.id] ? 'Objective complete · −25 stamina' : `${task.note} · −25 stamina on completion`}</small></div></div>)}<p className="stamina-note"><Footprints size={13}/> Starting stamina: 100 · each completed task uses 25</p>
          <button className="sol-button" onClick={advanceDay} disabled={game.ended}><Play size={14} fill="currentColor"/> Advance one sol</button><button className="ration-button" onClick={rationFood} disabled={game.ended}><Package size={14}/> Repack food supplies <span>+8 FOOD</span></button>
        </section>
        <div className="crew-status-bar"><HeartPulse size={15}/><span>Crew condition</span><b>{Math.round(game.crew.reduce((sum, person) => sum + person.health, 0) / game.crew.length)}%</b><i/><Sparkles size={14}/><b>{Math.round(game.crew.reduce((sum, person) => sum + person.morale, 0) / game.crew.length)}%</b></div>
        <p className="game-footnote">Educational game model · all values are illustrative, not NASA specifications.</p>
      </aside>
    </main>
    {briefingOpen && <div className="briefing-overlay"><section className="briefing-dialog"><div className="briefing-orbit"><Moon size={26}/><span>✦</span></div><p className="eyebrow">LUNABASE · CREW BRIEFING</p><h1>How will your habitat<br/><em>stay alive?</em></h1><p className="briefing-copy">Before stepping onto the Moon, learn the essentials. ECLSS is the life-support system that helps your crew breathe, drink, and live inside the habitat.</p><div className="briefing-grid"><article><Droplets/><b>Water</b><span>Recover water, then scout for lunar ice to replenish it.</span></article><article><Orbit/><b>Oxygen</b><span>Use processed water to help generate breathable oxygen.</span></article><article><Wind/><b>Clean air</b><span>Filter cabin air and remove contaminants.</span></article><article><BatteryCharging/><b>Power</b><span>Keep life-support equipment and the habitat running.</span></article><article><Leaf/><b>Food</b><span>Protect crew supplies for each day on the surface.</span></article></div><div className="briefing-bottom"><span><Compass size={15}/> Explore 3 sites · complete your task list</span><button onClick={() => setBriefingOpen(false)}>Start exploring <ChevronRight size={16}/></button></div><small className="briefing-disclaimer">Simplified educational model. Resource values are game assumptions.</small></section></div>}
    <MissionMinigame key={activeTask} task={activeTask} onComplete={() => completeSite(activeTask)} onClose={() => setActiveTask(null)}/>
    <MissionResult outcome={game.ended} onRestart={restart}/>
  </div>;
}
