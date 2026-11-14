import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, BatteryCharging, Check, ChevronRight, CircleHelp, Clock3, Compass, Droplets, Footprints, Gauge, HeartPulse, Leaf, Menu, Moon, Orbit, Package, Play, Radio, RotateCcw, Shield, Sparkles, Sun, Wind, Wrench, X } from './Icons.jsx';
import { getIncidentForDay, INITIAL_GAME, manageBase, takeAction } from './game.js';
import Moonwalk from './Moonwalk.jsx';
import MissionMinigame from './MissionMinigame.jsx';
import HabitatInterior from './HabitatInterior.jsx';

const format = (value) => `${Math.round(value)}%`;
const SAVE_KEY = 'lunabase-session-v1';
function loadSessionGame() { try { const saved = JSON.parse(sessionStorage.getItem(SAVE_KEY)); if (!saved) return structuredClone(INITIAL_GAME); const oldStamina = Number(saved.stamina); saved.stamina = Number.isFinite(oldStamina) ? Math.max(0, Math.min(5, oldStamina)) : 5; saved.resources ??= structuredClone(INITIAL_GAME.resources); if (saved.foodModelVersion !== 2) { saved.resources.food = Math.max(0, Math.min(126, Math.round((Number(saved.resources.food) || 0) * (126 / 76)))); saved.foodModelVersion = 2; } saved.sampleCount ??= 0; saved.lastIceDay ??= 0; saved.lastBeaconDay ??= 0; saved.lastPowerRepairDay ??= 0; saved.solarFault ??= false; saved.exploration ??= structuredClone(INITIAL_GAME.exploration); return saved; } catch { return structuredClone(INITIAL_GAME); } }
function hasSavedSession() { try { return Boolean(sessionStorage.getItem(SAVE_KEY)); } catch { return false; } }

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
      <div className="crew-stat"><span><HeartPulse size={13} /> Health · {person.health >= 70 ? 'Good' : person.health >= 40 ? 'Watch' : 'Critical'}</span><div className="crew-meter"><Meter value={person.health} color={person.health < 40 ? 'rose' : person.health < 70 ? 'amber' : 'mint'} label="Health" /></div><b className={person.health < 40 ? 'text-rose' : ''}>{format(person.health)}</b></div>
      <div className="crew-stat morale"><span><Sparkles size={13} /> Psychology · {person.morale >= 70 ? 'Good' : person.morale >= 40 ? 'Watch' : 'Critical'}</span><div className="crew-meter"><Meter value={person.morale} color={person.morale < 40 ? 'rose' : person.morale < 70 ? 'amber' : 'mint'} label="Psychology" /></div><b className={person.morale < 40 ? 'text-rose' : ''}>{format(person.morale)}</b></div>
      <div className={`crew-state ${person.health < 40 || person.morale < 40 ? 'state-low' : ''}`}>{person.health < 40 ? 'Needs medical care' : person.morale < 40 ? 'Psychological support' : 'Stable'}</div>
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

function MissionResult({ outcome, game, onRestart }) {
  if (!outcome) return null;
  const success = outcome === 'won';
  const missingRelay = !success && game.day >= 30 && !game.exploration.beacon;
  return <div className="result-backdrop"><div className="result-modal"><div className={`result-icon ${success ? 'result-success' : 'result-failure'}`}>{success ? <Check size={26}/> : <X size={26}/>}</div><p className="eyebrow">LUNABASE · MISSION DEBRIEF</p><h2>{success ? 'Mission accomplished' : 'Mission ended'}</h2><p>{success ? 'The crew completed all 30 days on the lunar surface. A thoughtful balance of supplies, systems, and crew care brought everyone home.' : missingRelay ? 'The Earth relay was never restored. Without a communications and navigation link, mission control could not verify a safe return, so the expedition could not be certified as complete.' : 'A critical supply or crew health reached zero. Review the timeline, choose a different strategy, and launch again.'}</p><button className="launch-button" onClick={onRestart}><RotateCcw size={16}/> Start a new mission</button></div></div>;
}

export default function App() {
  const [game, setGame] = useState(loadSessionGame);
  const [briefingOpen, setBriefingOpen] = useState(() => !hasSavedSession());
  const [activeTask, setActiveTask] = useState(null);
  const [activeBaseTask, setActiveBaseTask] = useState(null);
  const [baseMode, setBaseMode] = useState(false);
  const [dayTransition, setDayTransition] = useState(false);
  const [hqMessage, setHqMessage] = useState('No message sent yet. Restore the Signal Beacon to open the uplink.');
  useEffect(() => { try { sessionStorage.setItem(SAVE_KEY, JSON.stringify(game)); } catch { /* Session saving is optional in private browsing. */ } }, [game]);
  useEffect(() => {
    if (!dayTransition) return undefined;
    const timer = window.setTimeout(() => { setGame((current) => takeAction({ ...current, stamina: 5 }, 'advance')); setDayTransition(false); }, 1700);
    return () => window.clearTimeout(timer);
  }, [dayTransition]);
  useEffect(() => { if (game.stamina <= 0 && !game.ended) setDayTransition(true); }, [game.ended, game.stamina]);
  useEffect(() => {
    if (game.suitOxygen <= 0 && !baseMode && !briefingOpen && !game.ended) {
      setActiveTask(null);
      setBaseMode(true);
    }
  }, [baseMode, briefingOpen, game.ended, game.suitOxygen]);
  useEffect(() => {
    const handleBaseKey = (event) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.key.toLowerCase() !== 'r') return;
      if (event.target instanceof HTMLElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) || event.target.isContentEditable)) return;
      if (!baseMode || briefingOpen || activeTask || game.ended || game.suitOxygen <= 0) return;
      event.preventDefault();
      setBaseMode(false);
    };
    window.addEventListener('keydown', handleBaseKey);
    return () => window.removeEventListener('keydown', handleBaseKey);
  }, [activeTask, baseMode, briefingOpen, game.ended, game.suitOxygen]);
  const restart = () => { try { sessionStorage.removeItem(SAVE_KEY); } catch { /* Continue with an in-memory restart if storage is unavailable. */ } setGame(structuredClone(INITIAL_GAME)); setBriefingOpen(true); setDayTransition(false); setBaseMode(false); };
  const baseAction = (action) => {
    if (game.stamina <= 0 || dayTransition || game.ended) return;
    setGame((current) => {
      if (current.stamina <= 0) return current;
      const updated = manageBase(current, action);
      return updated === current ? current : { ...updated, stamina: Math.max(0, current.stamina - 1), satiety: Math.max(0, current.satiety - 20) };
    });
    if (game.stamina <= 1) setDayTransition(true);
  };
  const rationFood = () => baseAction('eat');
  const contactHq = () => {
    if (!game.systems.comms || game.stamina <= 0 || dayTransition) return;
    setGame((current) => ({ ...current, stamina: Math.max(0, current.stamina - 1), satiety: Math.max(0, current.satiety - 20) }));
    setHqMessage(`Sol ${String(game.day).padStart(2, '0')}: Status report sent. Life support, crew condition, and supply levels transmitted to mission control.`);
    if (game.stamina <= 1) setDayTransition(true);
  };
  const completeBaseTask = () => { if (activeBaseTask === 'powerRepair') completeSite('powerRepair'); else if (activeBaseTask) baseAction(activeBaseTask); setActiveBaseTask(null); };
  const inspectSite = (site) => { const alreadyToday = site === 'ice' ? game.lastIceDay === game.day : site === 'beacon' ? game.lastBeaconDay === game.day : site === 'powerRepair' ? game.lastPowerRepairDay === game.day : false; if (!alreadyToday && availableTasks.includes(site) && game.suitOxygen >= 12 && game.stamina > 0) setActiveTask(site); };
  const completeSite = (site) => {
    if (!baseMode && game.suitOxygen < 12) return;
    setGame((current) => {
    if ((site === 'sample' && current.ended) || (site === 'ice' && current.lastIceDay === current.day) || (site === 'beacon' && current.lastBeaconDay === current.day) || (site === 'powerRepair' && current.lastPowerRepairDay === current.day)) return current;
    const next = structuredClone(current);
    if (site !== 'sample') next.exploration[site] = true;
    if (!baseMode) next.suitOxygen = Math.max(0, current.suitOxygen - 12);
    next.stamina = Math.max(0, current.stamina - 1);
    next.satiety = Math.max(0, current.satiety - 20);
    const rewards = {
      ice: { title: 'Ice deposit surveyed', detail: 'The crew collected raw water-bearing material for the recovery system.', apply: () => { next.resources.wastewater = Math.min(100, (next.resources.wastewater || 0) + 15); next.systems.oxygen = Math.min(100, next.systems.oxygen + 4); next.lastIceDay = next.day; } },
      sample: { title: 'Lunar sample collected', detail: 'A rock sample was secured. Samples can be collected again while the crew has stamina.', apply: () => { next.sampleCount = (next.sampleCount || 0) + 1; next.crew.forEach((person) => { person.morale = Math.min(100, person.morale + 2); }); } },
      beacon: { title: 'Lunar relay restored', detail: 'The outpost is linked to the lunar relay network. Earth contact and navigation support are back online.', apply: () => { next.resources.power = Math.min(100, next.resources.power + 10); next.systems.comms = 100; next.lastBeaconDay = next.day; next.crew.forEach((person) => { person.morale = Math.min(100, person.morale + 8); }); } },
      powerRepair: { title: 'Solar array circuit repaired', detail: 'The sparking junction is safe and the solar panels can charge the habitat batteries again.', apply: () => { next.solarFault = false; next.lastPowerRepairDay = next.day; next.resources.power = Math.min(100, next.resources.power + 14); next.systems.wear = Math.max(0, next.systems.wear - 8); } },
    };
    const reward = rewards[site];
    reward.apply();
    next.log = [{ day: next.day, title: reward.title, detail: reward.detail, tone: 'good' }, ...next.log].slice(0, 5);
    return next;
    });
    setActiveTask(null);
    if (game.stamina <= 1) setDayTransition(true);
  };
  const tasks = [
    { id: 'ice', title: 'Collect lunar ice water', note: 'Day 3 of each 5-day cycle only' },
    { id: 'sample', title: 'Collect a moon-rock sample', note: 'Bring a sample back to base' },
    { id: 'beacon', title: 'Restore the Earth relay', note: 'Day 1 of each 5-day cycle only · restore Earth communications and navigation' },
    { id: 'powerRepair', title: 'Repair solar array circuit', note: 'Day 4 of each 5-day cycle only · repair the sparking fault' },
  ];
  const incident = getIncidentForDay(game.day);
  const availableTasks = ['sample', ...(incident?.id === 'beacon' && game.lastBeaconDay !== game.day ? ['beacon'] : []), ...(incident?.id === 'ice' && game.lastIceDay !== game.day ? ['ice'] : []), ...(incident?.id === 'powerRepair' && game.lastPowerRepairDay !== game.day ? ['powerRepair'] : [])];
  const visibleFoundSites = { ...game.exploration, sample: false, sampleCount: game.sampleCount || 0, ice: game.lastIceDay === game.day, beacon: game.lastBeaconDay === game.day, powerRepair: game.lastPowerRepairDay === game.day };
  const completed = Object.values(game.exploration).filter(Boolean).length;
  return <div className="game-shell">
    <header className="game-topbar"><a className="brand" href="#top" aria-label="LunaBase home"><span className="brand-mark"><Moon size={20}/><span/></span><span className="brand-word">luna<span>base</span><small>MOON EXPEDITION</small></span></a><div className="game-day"><span className="live-dot"/> SOL {String(game.day).padStart(2, '0')} <i>/</i> 30</div><div className="resource-strip"><div title="Stored in the habitat oxygen tank"><Orbit size={15}/><span>BASE O₂</span><b>{Math.round(game.resources.oxygen)}</b></div><div title="Oxygen left in the spacesuit"><Footprints size={15}/><span>SUIT O₂</span><b>{Math.round(game.suitOxygen)}</b></div><div><Droplets size={15}/><span>H₂O</span><b>{Math.round(game.resources.water)}</b></div><div><Wind size={15}/><span>AIR</span><b>{Math.round(game.systems.air)}</b></div><div title="Meal portions · a 126-portion shipment arrives every 14 sols"><Leaf size={15}/><span>FOOD</span><b>{Math.round(game.resources.food)}</b></div><div><BatteryCharging size={15}/><span>POWER</span><b>{Math.round(game.resources.power)}</b></div><div className="satiety-resource" title="Crew satiety; below 50% reduces tomorrow’s stamina by 1"><Leaf size={15}/><span>SATIETY</span><b>{Math.round(game.satiety)}%</b><i><span style={{ width: `${game.satiety}%` }}/></i></div><div className="stamina-resource" title="Daily crew stamina: 5 task points; low satiety may reduce it"><HeartPulse size={15}/><span>STA</span><b>{game.stamina}/5</b><i><span style={{ width: `${game.stamina / 5 * 100}%` }}/></i></div></div><button className="base-toggle" disabled={baseMode && game.suitOxygen <= 0} onClick={() => { setBaseMode((current) => !current); setActiveTask(null); }}><Orbit size={14}/>{baseMode ? 'Return to surface' : 'Enter base'}</button><button className="game-restart" onClick={restart}><RotateCcw size={14}/> Restart</button></header>
    <main className={`game-layout ${dayTransition ? 'day-transitioning' : ''}`} id="top">
      {baseMode ? <HabitatInterior game={game} onAction={baseAction} onMiniGame={setActiveBaseTask} onLeave={() => setBaseMode(false)} lockedOutside={game.suitOxygen <= 0}/> : <><section className="game-view"><Moonwalk day={game.day} foundSites={visibleFoundSites} availableTasks={availableTasks} incident={incident} suitOxygen={game.suitOxygen} onStep={() => setGame((current) => ({ ...current, suitOxygen: Math.max(0, current.suitOxygen - 1) }))} onInteract={inspectSite} onEnterBase={() => setBaseMode(true)} disabled={Boolean(activeTask || briefingOpen || dayTransition)}/><div className="game-message"><span className="live-dot"/><span>{incident?.title || game.log[0]?.title}</span><i>{incident?.message || game.log[0]?.detail}</i></div></section>
      <aside className="game-sidebar">
        <section className="game-info-card"><div className="game-card-heading"><span className="info-sigil"><Wind size={17}/></span><div><small>HABITAT LIFE SUPPORT</small><h2>ECLSS info</h2></div></div><p className="eclss-lead">ECLSS keeps the crew alive by recycling and managing the habitat’s essential resources.</p>
          <div className="eclss-row"><span className="eclss-icon water"><Droplets size={15}/></span><div><b>Water</b><small>Recover used water; lunar ice can replenish reserves.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon oxygen"><Orbit size={15}/></span><div><b>Oxygen</b><small>Generate breathable oxygen from processed water.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon air"><Wind size={15}/></span><div><b>Clean air</b><small>Filter cabin air and remove contaminants.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon power"><BatteryCharging size={15}/></span><div><b>Power</b><small>Run recovery, filtration, lights and equipment.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon food"><Leaf size={15}/></span><div><b>Food</b><small>Keep the crew supplied throughout the mission.</small></div></div>
        </section>
        <section className="task-card"><div className="task-heading"><div><small>MISSION OBJECTIVES</small><h2>Task list</h2></div><span>{completed}/{tasks.length}</span></div><div className={`relay-status ${game.systems.comms ? 'relay-online' : ''}`}><Radio size={14}/><span>{game.systems.comms ? 'EARTH LINK ONLINE · navigation and mission support available' : 'EARTH LINK OFFLINE · restore the relay before Sol 30'}</span></div><div className="task-progress"><span style={{ width: `${completed / tasks.length * 100}%` }}/></div>{tasks.map((task, index) => { const done = task.id === 'sample' ? game.sampleCount > 0 : Boolean(game.exploration[task.id]); return <div className={`task-item ${done ? 'task-complete' : ''}`} key={task.id}><span className="task-check">{task.id === 'sample' && game.sampleCount ? `×${game.sampleCount}` : done ? '✓' : String(index + 1).padStart(2, '0')}</span><div><b>{task.title}</b><small>{task.id === 'sample' && game.sampleCount ? `${game.sampleCount} samples collected · repeatable · costs 1 stamina each` : done ? 'Objective complete' : `${task.note} · costs 1 stamina`}</small></div></div>})}<p className="stamina-note"><Footprints size={13}/> Daily stamina: 5 task points · each task costs 1</p>
          <button className="ration-button" onClick={rationFood} disabled={game.ended || game.stamina <= 0 || dayTransition || game.resources.food < 3 || game.satiety >= 100}><Package size={14}/> Eat a crew meal <span>−3 portions · +40 satiety · −1 STA</span></button>
        </section>
        <section className="hq-contact-card"><div className="hq-contact-heading"><span><Radio size={16}/></span><div><small>MISSION CONTROL</small><h2>NASA Headquarters contact</h2></div><b className={game.systems.comms ? 'hq-online' : ''}>{game.systems.comms ? 'UPLINK' : 'OFFLINE'}</b></div><p>{hqMessage}</p><button onClick={contactHq} disabled={!game.systems.comms || game.stamina <= 0 || dayTransition || game.ended}><Radio size={14}/> Send status report <small>−1 STA · −20 satiety</small></button>{!game.systems.comms && <small className="hq-unlock-note">Complete the Day 1 Signal Beacon task to restore communication.</small>}</section>
        <div className="crew-status-bar"><HeartPulse size={15}/><span>Crew condition</span><b>{Math.round(game.crew.reduce((sum, person) => sum + person.health, 0) / game.crew.length)}%</b><i/><Sparkles size={14}/><b>{Math.round(game.crew.reduce((sum, person) => sum + person.morale, 0) / game.crew.length)}%</b><i/><Leaf size={14}/><b>{game.satiety}%</b></div>
        <p className="game-footnote">Educational game model · all values are illustrative, not NASA specifications.</p>
      </aside></>}
    </main>
    {briefingOpen && <div className="briefing-overlay"><section className="briefing-dialog"><div className="briefing-orbit"><Moon size={26}/><span>✦</span></div><p className="eyebrow">LUNABASE · CREW BRIEFING</p><h1>How will your habitat<br/><em>stay alive?</em></h1><p className="briefing-copy">Before stepping onto the Moon, learn the essentials. ECLSS is the life-support system that helps your crew breathe, drink, and live inside the habitat.</p><div className="briefing-grid"><article><Droplets/><b>Water</b><span>Recover water, then scout for lunar ice to replenish it.</span></article><article><Orbit/><b>Oxygen</b><span>Use processed water to help generate breathable oxygen.</span></article><article><Wind/><b>Clean air</b><span>Filter cabin air and remove contaminants.</span></article><article><BatteryCharging/><b>Power</b><span>Keep life-support equipment and the habitat running.</span></article><article><Leaf/><b>Food</b><span>Protect crew supplies for each day on the surface.</span></article></div><div className="briefing-bottom"><span><Compass size={15}/> Explore 3 sites · complete your task list</span><button onClick={() => setBriefingOpen(false)}>Start exploring <ChevronRight size={16}/></button></div><small className="briefing-disclaimer">Simplified educational model. Resource values are game assumptions.</small></section></div>}
    <MissionMinigame key={activeTask} task={activeTask} onComplete={() => completeSite(activeTask)} onClose={() => setActiveTask(null)}/>
    <MissionMinigame key={activeBaseTask} task={activeBaseTask} onComplete={completeBaseTask} onClose={() => setActiveBaseTask(null)}/>
    {dayTransition && <div className="day-transition-overlay"><div className="day-transition-card"><span>☾</span><p>SHIFT COMPLETE</p><h2>Sol {game.day} complete</h2><small>Resting the crew and preparing tomorrow's mission…</small><div className="day-transition-progress"><i/></div></div></div>}
    <MissionResult outcome={game.ended} game={game} onRestart={restart}/>
  </div>;
}
