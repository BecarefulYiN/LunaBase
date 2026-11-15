import FoodMission from './FoodMission.jsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, BatteryCharging, Check, ChevronRight, CircleHelp, Clock3, Compass, Droplets, Footprints, Gauge, HeartPulse, Leaf, Menu, Moon, Orbit, Package, Play, Radio, RotateCcw, Shield, Sparkles, Wind, Wrench, X } from './Icons.jsx';
import { INITIAL_GAME, manageBase, takeAction } from './game.js';
import Moonwalk from './Moonwalk.jsx';
import MissionMinigame from './MissionMinigame.jsx';
import HabitatInterior from './HabitatInterior.jsx';

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

function MissionResult({ outcome, game, onRestart }) {
  if (!outcome) return null;
  const success = outcome === 'won';
  const missingRelay = !success && game.day > 14 && !game.exploration.beacon;
  return <div className="result-backdrop"><div className="result-modal"><div className={`result-icon ${success ? 'result-success' : 'result-failure'}`}>{success ? <Check size={26}/> : <X size={26}/>}</div><p className="eyebrow">LUNABASE · MISSION DEBRIEF</p><h2>{success ? 'Mission accomplished' : 'Mission ended'}</h2><p>{success ? 'The crew completed the 14-day lunar mission. A thoughtful balance of supplies, systems, and crew care brought everyone home.' : missingRelay ? 'The Earth relay was never restored. Without a communications and navigation link, mission control could not verify a safe return, so the expedition could not be certified as complete.' : 'A critical supply or crew health reached zero. Review the timeline, choose a different strategy, and launch again.'}</p><button className="launch-button" onClick={onRestart}><RotateCcw size={16}/> Start a new mission</button></div></div>;
}

function BriefingPictureSteps() {
  return <div className="briefing-picture-steps" aria-label="Three-step illustrated guide"><article><span><Radio size={25}/></span><b>1 · Find today’s task</b><small>Day 1: go to the glowing Signal Beacon.</small></article><article><span className="guide-keys"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><strong>+</strong><kbd>E</kbd></span><b>2 · Walk up and press E</b><small>Use the arrow keys instead of WASD if you prefer.</small></article><article><span><Compass size={25}/></span><b>3 · Play and return</b><small>Finish the mini-game. Press R near the base to refill your suit.</small></article><p className="guide-goal">🎯 Goal: restore Earth contact and keep the crew safe for 14 days.</p></div>;
}

export default function App() {
  const [game, setGame] = useState(INITIAL_GAME);
  const lastDay = useRef(INITIAL_GAME.day);
  const [dayNotice, setDayNotice] = useState(null);
  const [guideSeen, setGuideSeen] = useState({});
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [activeTask, setActiveTask] = useState(null);
  const [activeBaseTask, setActiveBaseTask] = useState(null);
  const [foodMission, setFoodMission] = useState(null);
  const [baseMode, setBaseMode] = useState(false);
  useEffect(() => {
    if (game.day !== lastDay.current) {
      lastDay.current = game.day;
      setDayNotice(game.day);
    }
  }, [game.day]);
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
  useEffect(() => {
    if (!dayNotice) return undefined;
    const timer = window.setTimeout(() => setDayNotice(null), 3600);
    return () => window.clearTimeout(timer);
  }, [dayNotice]);
  const markGuideSeen = useCallback((key) => {
    setGuideSeen((current) => current[key] === game.day ? current : { ...current, [key]: game.day });
  }, [game.day]);
  const canShowGuide = (key) => guideSeen[key] === undefined || guideSeen[key] === game.day;
  const restart = () => { lastDay.current = INITIAL_GAME.day; setFoodMission(null); setGame(structuredClone(INITIAL_GAME)); setBriefingOpen(true); setDayNotice(null); setGuideSeen({}); };
  const advanceDay = () => setGame((current) => takeAction(current, 'advance'));
  const rationFood = () => setFoodMission('inventory');
  const repackBlocked = Boolean(game.ended || !game.systems.comms || !game.exploration.beacon || game.lastRepackDay === game.day || game.foodReserve <= 0 || game.resources.food >= 100 || game.stamina <= 0);
  const finishFoodMission = () => { setGame(current => takeAction(current, 'ration')); setFoodMission(null); };
  const baseAction = (action) => setGame((current) => manageBase(current, action));
  const completeBaseTask = () => { if (activeBaseTask) baseAction(activeBaseTask); setActiveBaseTask(null); };
  const inspectSite = (site) => { if (!game.dailyFieldDone?.[site] && game.suitOxygen >= 12) setActiveTask(site); };
  const completeSite = (site) => {
    if (game.suitOxygen < 12) return;
    setGame((current) => {
    if (current.dailyFieldDone?.[site] || current.stamina <= 0) return current;
    const next = structuredClone(current);
    const firstDiscovery = !current.exploration[site];
    next.exploration[site] = true;
    next.dailyFieldDone = { ...(current.dailyFieldDone || {}), [site]: true };
    next.suitOxygen = Math.max(0, current.suitOxygen - 12);
    next.stamina = Math.max(0, current.stamina - 1);
    const rewards = {
      ice: { title: 'Ice deposit surveyed', detail: 'A promising lunar ice deposit was found. Raw water-bearing material was collected for treatment.', apply: () => { next.resources.wastewater = Math.min(100, (next.resources.wastewater || 0) + 15); next.systems.oxygen = Math.min(100, next.systems.oxygen + 4); } },
      sample: { title: 'Lunar sample collected', detail: 'The crew collected a rock sample. The field discovery lifted morale.', apply: () => next.crew.forEach((person) => { person.morale = Math.min(100, person.morale + 6); }) },
      beacon: { title: 'Lunar relay restored', detail: 'The outpost is linked to the lunar relay network. Earth contact and navigation support are back online.', apply: () => { next.resources.power = Math.min(100, next.resources.power + 10); next.systems.comms = 100; next.crew.forEach((person) => { person.morale = Math.min(100, person.morale + 8); }); } },
    };
    const reward = rewards[site];
    if (firstDiscovery) reward.apply();
    const title = firstDiscovery ? reward.title : `${reward.title} · daily repeat`;
    const detail = firstDiscovery ? reward.detail : 'Daily objective complete. The first-discovery reward was already collected.';
    next.log = [{ day: next.day, title, detail, tone: 'good' }, ...next.log].slice(0, 5);
    return next.stamina <= 0 ? takeAction(next, 'advance') : next;
    });
    setActiveTask(null);
  };
  const fieldSchedule = [
    { id: 'beacon', title: 'Restore the Signal Beacon', note: 'Walk to the purple beacon and press E.' },
    { id: 'sample', title: 'Collect a moon-rock sample', note: 'Walk to the gold rock marker and press E.' },
    { id: 'ice', title: 'Survey lunar water ice', note: 'Walk to the blue ice marker and press E.' },
  ];
  const dailyFieldTask = fieldSchedule[(game.day - 1) % fieldSchedule.length];
  const serviceSchedule = [
    { id: 'air', station: 'air', title: 'Clean the cabin air', note: 'Enter the base and run the air scrubber.', logTitle: 'Cabin air filtered' },
    { id: 'water', station: 'water', title: 'Recover clean water', note: 'Enter the base and calibrate the water purifier.', logTitle: 'Recovered water purified' },
    { id: 'oxygen', station: 'oxygen', title: 'Generate base oxygen', note: 'Use clean water and power in the oxygen generator.', logTitle: 'Oxygen generator cycle complete' },
    { id: 'meal', station: 'galley', title: 'Eat a crew meal', note: 'Visit the galley to restore crew satiety.', logTitle: 'Meal break' },
    { id: 'power', station: 'solar', title: 'Recharge the power bank', note: 'Align the solar couplers inside the base.', logTitle: 'Solar array charged habitat batteries' },
  ];
  const dailyServiceTask = serviceSchedule[(game.day - 1) % serviceSchedule.length];
  const dailyServiceTaskDone = game.log.some((entry) => entry.day === game.day && entry.title === dailyServiceTask.logTitle);
  const dailyTasks = [
    { id: 'field', title: dailyFieldTask.title, note: dailyFieldTask.note, done: Boolean(game.dailyFieldDone?.[dailyFieldTask.id]) },
    { id: 'service', title: dailyServiceTask.title, note: dailyServiceTask.note, done: dailyServiceTaskDone },
    { id: 'readiness', title: 'Check crew & suit readiness', note: game.satiety < 50 ? `Satiety ${game.satiety}% — eat at the galley to reach 50%.` : game.suitOxygen < 30 ? `Suit oxygen ${Math.round(game.suitOxygen)}% — refill at the dock before going outside.` : `Satiety ${game.satiety}% · Suit oxygen ${Math.round(game.suitOxygen)}% — both are ready.`, done: game.satiety >= 50 && game.suitOxygen >= 30 },
  ];
  const fieldGuideKey = `field-${dailyFieldTask.id}`;
  const baseEntryGuideKey = `base-entry-${dailyServiceTask.station}`;
  const stationGuideKey = `station-${game.suitOxygen <= 0 ? 'suit' : dailyServiceTask.station}`;
  const showFieldGuide = !dailyTasks[0].done && canShowGuide(fieldGuideKey);
  const showBaseEntryGuide = dailyTasks[0].done && !dailyServiceTaskDone && canShowGuide(baseEntryGuideKey);
  const showStationGuide = canShowGuide(stationGuideKey);
  const completedDailyTasks = dailyTasks.filter((task) => task.done).length;
  return <div className="game-shell">
    <header className="game-topbar"><a className="brand" href="#top" aria-label="LunaBase home"><span className="brand-mark"><Moon size={20}/><span/></span><span className="brand-word">luna<span>base</span><small>MOON EXPEDITION</small></span></a><div className="game-day"><span className="live-dot"/> SOL {String(game.day).padStart(2, '0')} <i>/</i> 14</div><div className="resource-strip"><div title="Stored in the habitat oxygen tank"><Orbit size={15}/><span>BASE O₂</span><b>{Math.round(game.resources.oxygen)}</b></div><div title="Oxygen left in the spacesuit"><Footprints size={15}/><span>SUIT O₂</span><b>{Math.round(game.suitOxygen)}</b></div><div><Droplets size={15}/><span>H₂O</span><b>{Math.round(game.resources.water)}</b></div><div><Wind size={15}/><span>AIR</span><b>{Math.round(game.systems.air)}</b></div><div><Leaf size={15}/><span>FOOD</span><b>{Math.round(game.resources.food)}</b></div><div><BatteryCharging size={15}/><span>POWER</span><b>{Math.round(game.resources.power)}</b></div><div className="stamina-resource" title="Crew stamina out of 5"><HeartPulse size={15}/><span>STA</span><b>{game.stamina}</b><i><span style={{ width: `${game.stamina * 20}%` }}/></i></div></div><button className="base-toggle" disabled={baseMode && game.suitOxygen <= 0} onClick={() => { setBaseMode((current) => !current); setActiveTask(null); }}><Orbit size={14}/>{baseMode ? 'Return to surface' : 'Enter base'}</button><button className="game-restart" onClick={restart}><RotateCcw size={14}/> Restart</button></header>
    {dayNotice!==null&&<div className="day-change-notice" role="status" aria-live="polite"><span className="day-change-icon"><Orbit size={22}/></span><div><small>NEW LUNAR DAY</small><b>SOL {String(dayNotice).padStart(2,'0')} HAS STARTED</b><p>Today’s task list has been updated.</p></div><button onClick={()=>setDayNotice(null)} aria-label="Dismiss day update"><X size={17}/></button></div>}
    <main className="game-layout" id="top">
      {baseMode ? <HabitatInterior game={game} onAction={baseAction} onMiniGame={setActiveBaseTask} onAdvance={advanceDay} onLeave={() => setBaseMode(false)} lockedOutside={game.suitOxygen <= 0} guideStation={game.suitOxygen <= 0 ? (showStationGuide ? 'suit' : null) : (!dailyServiceTaskDone && showStationGuide ? dailyServiceTask.station : null)} guideTaskTitle={game.suitOxygen <= 0 ? 'Refill suit oxygen' : dailyServiceTask.title} onGuideSeen={markGuideSeen} dailyTasks={dailyTasks} dailyProgress={completedDailyTasks}/> : <><aside className="game-eclss-sidebar">
        <section className="game-info-card"><div className="game-card-heading"><span className="info-sigil"><Wind size={17}/></span><div><small>HABITAT LIFE SUPPORT</small><h2>ECLSS info</h2></div></div><p className="eclss-lead">ECLSS keeps the crew alive by recycling and managing the habitat’s essential resources.</p>
          <div className="eclss-row"><span className="eclss-icon water"><Droplets size={15}/></span><div><b>Water</b><small>Recover used water; lunar ice can replenish reserves.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon oxygen"><Orbit size={15}/></span><div><b>Oxygen</b><small>Generate breathable oxygen from processed water.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon air"><Wind size={15}/></span><div><b>Clean air</b><small>Filter cabin air and remove contaminants.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon power"><BatteryCharging size={15}/></span><div><b>Power</b><small>Run recovery, filtration, lights and equipment.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon food"><Leaf size={15}/></span><div><b>Food</b><small>Keep the crew supplied throughout the mission.</small></div></div>
        </section>
      </aside><section className="game-view"><Moonwalk day={game.day} foundSites={game.exploration} dailyDone={game.dailyFieldDone || {}} suitOxygen={game.suitOxygen} guideBase={showBaseEntryGuide} guideBaseKey={baseEntryGuideKey} guideTaskTitle={dailyServiceTask.title} guideSiteId={showFieldGuide ? dailyFieldTask.id : null} onGuideSeen={markGuideSeen} onStep={() => setGame((current) => ({ ...current, suitOxygen: Math.max(0, current.suitOxygen - 1) }))} onInteract={inspectSite} onEnterBase={() => setBaseMode(true)} disabled={Boolean(activeTask || briefingOpen || foodMission)}/><div className="game-message"><span className="live-dot"/><span>{game.log[0]?.title}</span><i>{game.log[0]?.detail}</i></div></section>
      <aside className="game-sidebar">
        <section className="task-card"><div className="task-heading"><div><small>SOL {String(game.day).padStart(2, '0')} · TODAY</small><h2>Daily task list</h2></div><span>{completedDailyTasks}/{dailyTasks.length}</span></div><div className={`relay-status ${game.systems.comms ? 'relay-online' : ''}`}><Radio size={14}/><span>{game.systems.comms ? 'EARTH LINK ONLINE · navigation and mission support available' : 'EARTH LINK OFFLINE · restore the relay by Sol 14'}</span></div><div className="task-progress"><span style={{ width: `${completedDailyTasks / dailyTasks.length * 100}%` }}/></div>{dailyTasks.map((task, index) => <div className={`task-item ${task.done ? 'task-complete' : ''}`} key={task.id}><span className="task-check">{task.done ? '✓' : String(index + 1).padStart(2, '0')}</span><div><b>{task.title}</b><small>{task.note}</small></div></div>)}<p className="stamina-note"><Footprints size={13}/> Field and base tasks cost 1 stamina. At 0, the next Sol begins; field tasks reopen, but discovery rewards are one-time.</p>
          <button className="sol-button" onClick={advanceDay} disabled={game.ended}><Play size={14} fill="currentColor"/> Advance one sol</button><button className="ration-button" onClick={rationFood} disabled={repackBlocked}><Radio size={14}/> Earth-assisted food mission</button><p className="stamina-note">Ready food: {game.resources.food} | Onboard reserve: {game.foodReserve}. {!game.systems.comms ? 'Restore the Signal Beacon to contact Earth.' : game.lastRepackDay === game.day ? 'Completed today. Available again tomorrow.' : game.foodReserve <= 0 ? 'Reserve empty. Earth cannot instantly deliver food.' : game.resources.food >= 100 ? 'Ready-food storage is full.' : 'Once per day; costs 1 stamina; transfers up to 8 reserve units.'}</p>
        </section>
        <div className="crew-status-bar"><HeartPulse size={15}/><span>Crew condition</span><b>{Math.round(game.crew.reduce((sum, person) => sum + person.health, 0) / game.crew.length)}%</b><i/><Sparkles size={14}/><b>{Math.round(game.crew.reduce((sum, person) => sum + person.morale, 0) / game.crew.length)}%</b><i/><Leaf size={14}/><b>{game.satiety}%</b></div>
        <p className="game-footnote">Educational game model · all values are illustrative, not NASA specifications.</p>
      </aside></>}
    </main>
    {briefingOpen && <div className="briefing-overlay"><section className="briefing-dialog"><div className="briefing-orbit"><Moon size={26}/><span>✦</span></div><p className="eyebrow">LUNABASE · CREW BRIEFING</p><h1>Start your first<br/><em>moon mission!</em></h1><p className="briefing-copy">Your first job is to repair the Signal Beacon. Follow these picture steps, then the game will guide you at each task.</p><BriefingPictureSteps/><div className="briefing-bottom"><span><Compass size={15}/> Day 1 goal · restore the Signal Beacon</span><button onClick={() => setBriefingOpen(false)}>Start exploring <ChevronRight size={16}/></button></div><small className="briefing-disclaimer">Simplified educational model. Resource values are game assumptions.</small></section></div>}
    <MissionMinigame key={activeTask} task={activeTask} onComplete={() => completeSite(activeTask)} onClose={() => setActiveTask(null)}/>
    <MissionMinigame key={activeBaseTask} task={activeBaseTask} onComplete={completeBaseTask} onClose={() => setActiveBaseTask(null)}/>
    {foodMission && <FoodMission game={game} blocked={repackBlocked} onComplete={finishFoodMission} onClose={() => setFoodMission(null)}/>}
    <MissionResult outcome={game.ended} game={game} onRestart={restart}/>
  </div>;
}



