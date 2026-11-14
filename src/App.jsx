import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, BatteryCharging, Check, ChevronRight, CircleHelp, Clock3, Compass, Droplets, Footprints, Gauge, HeartPulse, Leaf, Menu, Moon, Orbit, Package, Play, Radio, RotateCcw, Shield, Sparkles, Sun, Wind, Wrench, X } from './Icons.jsx';
import { getIncidentForDay, INITIAL_GAME, manageBase, takeAction } from './game.js';
import Moonwalk from './Moonwalk.jsx';
import MissionMinigame from './MissionMinigame.jsx';
import HabitatInterior from './HabitatInterior.jsx';

const format = (value) => `${Math.round(value)}%`;
const SAVE_KEY = 'lunabase-session-v1';
function loadSessionGame() { try { const saved = JSON.parse(sessionStorage.getItem(SAVE_KEY)); if (!saved) return structuredClone(INITIAL_GAME); const oldStamina = Number(saved.stamina); saved.stamina = Number.isFinite(oldStamina) ? Math.max(0, Math.min(5, oldStamina)) : 5; saved.resources ??= structuredClone(INITIAL_GAME.resources); if (saved.foodModelVersion !== 2) { saved.resources.food = Math.max(0, Math.min(126, Math.round((Number(saved.resources.food) || 0) * (126 / 76)))); saved.foodModelVersion = 2; } saved.sampleCount ??= 0; saved.lastSampleDay ??= 0; saved.lastIceDay ??= 0; saved.lastBeaconDay ??= 0; saved.lastPowerRepairDay ??= 0; saved.solarFault ??= false; saved.exploration ??= structuredClone(INITIAL_GAME.exploration); return saved; } catch { return structuredClone(INITIAL_GAME); } }
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

function DayOneConversation({ onStart }) {
  const [line, setLine] = useState(0);
  const messages = [
    { title: 'Welcome to LunaBase, Commander.', text: 'I’m Flight Director Chen at NASA Mission Control. Your crew is at the lunar south pole. Our goal is to keep everyone safe for 30 sols and complete the mission.' },
    { title: 'Your base is a team of systems.', text: 'Solar panels make power. Power runs the water filter, air scrubber, and oxygen generator. Recovered water helps make oxygen; the base oxygen tank refills your spacesuit.' },
    { title: 'Watch for special task days.', text: 'Today, Sol 1, repair the signal beacon so we can talk. Collect lunar ice on Sol 3 and repair the sparking solar array on Sol 4. These incidents repeat every five sols.' },
    { title: 'Your crew needs careful planning.', text: 'Each completed task uses 1 stamina and 20 satiety. Five stamina points end the day. Eat meals to keep satiety up; below 50% means 1 less stamina tomorrow.' },
    { title: 'Ready to explore?', text: 'Use WASD or the arrow keys to walk. Get close to a marker and press E. Press R near the habitat to go inside. Keep an eye on suit oxygen and return to refill.' },
  ];
  const current = messages[line];
  return <div className="briefing-overlay rpg-overlay"><section className="briefing-dialog rpg-dialog" role="dialog" aria-modal="true" aria-labelledby="nasa-dialog-title"><div className="rpg-frame"><div className="rpg-portrait" aria-label="NASA mission controller portrait"><svg viewBox="0 0 80 80" role="img"><rect width="80" height="80" fill="#263d66"/><path fill="#101a31" d="M10 80V54h8V38h8V22h8V14h22v8h8v16h8v16h8v26z"/><path fill="#78c4d9" d="M18 28h8V18h8V10h20v8h8v10h8v14h-8v8H26v-8h-8z"/><path fill="#c9f3e8" d="M26 26h8v8h-8zm20 0h8v8h-8z"/><path fill="#14213c" d="M30 29h4v4h-4zm20 0h4v4h-4z"/><path fill="#e89d5b" d="M34 38h12v8H34zm-6-4h6v8h-6zm18 0h6v8h-6z"/><path fill="#e2e6f1" d="M22 52h36v6h8v22H14V58h8z"/><path fill="#7096bb" d="M34 58h12v8H34zM18 68h44v6H18z"/><path fill="#ffcf6c" d="M8 46h8v8H8zm56 0h8v8h-8z"/></svg></div><div className="rpg-text-panel"><div className="rpg-speaker">NASA MISSION CONTROL <span>FLIGHT DIRECTOR CHEN</span></div><div className="rpg-copy"><small>BRIEFING {line + 1} / {messages.length}</small><h1 id="nasa-dialog-title">{current.title}</h1><p>{current.text}</p></div><div className="rpg-dialog-footer"><span>{messages.map((item,index)=><i className={index===line?'active':''} key={item.title}/>)}</span><button onClick={() => line === messages.length - 1 ? onStart() : setLine((step)=>step+1)}>{line === messages.length - 1 ? 'START MISSION' : '▼ CONTINUE'}</button></div></div></div><small className="rpg-disclaimer">LUNABASE-01 · TRAINING TRANSMISSION · GAME ASSUMPTIONS</small></section></div>;
}

function SettlementReport({ game, onContinue }) {
  const average = (key) => Math.round(game.crew.reduce((sum, member) => sum + member[key], 0) / game.crew.length);
  const completed = [game.exploration.beacon, game.exploration.ice, game.exploration.powerRepair].filter(Boolean).length;
  const checkpoint = game.day === 14;
  return <div className="settlement-overlay"><section className="settlement-panel" role="dialog" aria-modal="true" aria-labelledby="settlement-title"><p className="eyebrow">LUNABASE-01 · FLIGHT DIRECTOR REPORT</p><h1 id="settlement-title">{checkpoint ? '14-Sol Mission Checkpoint' : `Sol ${game.day} Daily Settlement`}</h1><p className="settlement-lead">All stamina has been used. Review today’s resources, crew condition, and mission progress before continuing.</p><div className="settlement-grid"><article><small>BASE RESOURCES</small><b>O₂ {Math.round(game.resources.oxygen)} · Water {Math.round(game.resources.water)} · Food {Math.round(game.resources.food)}</b><b>Power {Math.round(game.resources.power)} · Used water {Math.round(game.resources.wastewater || 0)}</b></article><article><small>LIFE SUPPORT</small><b>Air {Math.round(game.systems.air)}% · Water recovery {Math.round(game.systems.water)}%</b><b>Oxygen generation {Math.round(game.systems.oxygen)}% · Equipment wear {Math.round(game.systems.wear)}%</b></article><article><small>CREW CHECK</small><b>Average health {average('health')}% · Psychology {average('morale')}%</b><b>Satiety {Math.round(game.satiety)}% · Suit oxygen {Math.round(game.suitOxygen)}%</b></article><article><small>MISSION PROGRESS</small><b>Incidents handled {completed}/3 · Rock samples {game.sampleCount || 0}</b><b>Earth link {game.systems.comms ? 'online' : 'offline'} · {checkpoint ? 'Next delivery: 126 food portions' : 'Next delivery at Sol 15'}</b></article></div><div className="settlement-tip">{game.resources.power < 25 || game.resources.oxygen < 25 ? 'Tip: Restore power or base oxygen before spending more time outside.' : game.satiety < 50 ? 'Tip: Eat a crew meal before continuing; low satiety reduces tomorrow’s stamina.' : 'Tip: Prepare water, power, and oxygen systems before the next surface excursion.'}</div><button className="settlement-continue" onClick={onContinue}>Continue to Sol {game.day + 1} <ChevronRight size={18}/></button><small className="settlement-note">Game values are illustrative. A food shipment arrives at the start of Sol 15.</small></section></div>;
}

export default function App() {
  const [game, setGame] = useState(loadSessionGame);
  const [briefingOpen, setBriefingOpen] = useState(() => !hasSavedSession());
  const [activeTask, setActiveTask] = useState(null);
  const [activeBaseTask, setActiveBaseTask] = useState(null);
  const [baseMode, setBaseMode] = useState(false);
  const [dayTransition, setDayTransition] = useState(false);
  const [hqMessage, setHqMessage] = useState('No message sent yet. Restore the Signal Beacon to open the uplink.');
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [settlementGame, setSettlementGame] = useState(null);
  const [taskToast, setTaskToast] = useState('');
  const [dayOneGuideDismissed, setDayOneGuideDismissed] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [demoStep, setDemoStep] = useState(-1);
  const [demoStock, setDemoStock] = useState({ power: 45, raw: 10, water: 12, baseOxygen: 42, suitOxygen: 35, stamina: 5, satiety: 80 });
  useEffect(() => { try { sessionStorage.setItem(SAVE_KEY, JSON.stringify(game)); } catch { /* Session saving is optional in private browsing. */ } }, [game]);
  useEffect(() => {
    if (!demoPlaying) return undefined;
    const timer = window.setInterval(() => setDemoStep((step) => {
      if (step >= 4) { setDemoPlaying(false); return 4; }
      const next = step + 1;
      setDemoStock((stock) => {
        if (next === 0) return { ...stock, power: Math.min(100, stock.power + 20) };
        if (next === 1) return { ...stock, power: Math.max(0, stock.power - 4), raw: Math.max(0, stock.raw - 5), water: Math.min(100, stock.water + 4) };
        if (next === 2) return { ...stock, power: Math.max(0, stock.power - 5), water: Math.max(0, stock.water - 6), baseOxygen: Math.min(100, stock.baseOxygen + 18) };
        if (next === 3) return { ...stock, baseOxygen: Math.max(0, stock.baseOxygen - 13), suitOxygen: 100 };
        return { ...stock, stamina: Math.max(0, stock.stamina - 1), satiety: Math.max(0, stock.satiety - 20), suitOxygen: Math.max(0, stock.suitOxygen - 12) };
      });
      return next;
    }), 1500);
    return () => window.clearInterval(timer);
  }, [demoPlaying]);
  useEffect(() => {
    if (!dayTransition) return undefined;
    const timer = window.setTimeout(() => {
      setSettlementGame(game);
      setSettlementOpen(true);
      setDayTransition(false);
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [dayTransition, game]);
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
  const restart = () => { try { sessionStorage.removeItem(SAVE_KEY); } catch { /* Continue with an in-memory restart if storage is unavailable. */ } setGame(structuredClone(INITIAL_GAME)); setBriefingOpen(true); setDayTransition(false); setBaseMode(false); setDayOneGuideDismissed(false); };
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
  const lowResourceTip = game.suitOxygen <= 20 ? 'Suit oxygen is low. Return to the habitat and refill before exploring.' : game.satiety < 50 ? 'Satiety is below 50%. Eat a crew meal to protect tomorrow’s stamina.' : game.resources.oxygen < 25 ? 'Base oxygen is low. Run the oxygen generator in the habitat.' : game.resources.power < 20 ? 'Power is low. Check the solar array and save electricity.' : '';
  const completeSite = (site) => {
    if (!baseMode && game.suitOxygen < 12) return;
    setGame((current) => {
    if ((site === 'sample' && current.ended) || (site === 'ice' && current.lastIceDay === current.day) || (site === 'beacon' && current.lastBeaconDay === current.day) || (site === 'powerRepair' && current.lastPowerRepairDay === current.day)) return current;
    const next = structuredClone(current);
    if (site === 'sample') next.lastSampleDay = next.day;
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
    setTaskToast(`${reward.title} · −1 stamina · −20 satiety${site === 'ice' ? ' · +15 raw water' : site === 'beacon' ? ' · +10 power · Earth link restored' : site === 'powerRepair' ? ' · +14 power · wear reduced' : ' · sample added'}`);
    next.log = [{ day: next.day, title: reward.title, detail: reward.detail, tone: 'good' }, ...next.log].slice(0, 5);
    return next;
    });
    setActiveTask(null);
    if (game.stamina <= 1) setDayTransition(true);
  };
  const incident = getIncidentForDay(game.day);
  const availableTasks = ['sample', ...(incident?.id === 'beacon' && game.lastBeaconDay !== game.day ? ['beacon'] : []), ...(incident?.id === 'ice' && game.lastIceDay !== game.day ? ['ice'] : []), ...(incident?.id === 'powerRepair' && game.lastPowerRepairDay !== game.day ? ['powerRepair'] : [])];
  const incidentTaskNames = { beacon: 'Repair the signal beacon', ice: 'Collect lunar ice water', powerRepair: 'Repair the sparking solar array' };
  const todayTasks = [
    ...(incident ? [{ id: incident.id, title: incidentTaskNames[incident.id], done: incident.id === 'beacon' ? game.lastBeaconDay === game.day : incident.id === 'ice' ? game.lastIceDay === game.day : game.lastPowerRepairDay === game.day, required: true }] : []),
    { id: 'sample', title: 'Collect moon-rock sample', done: game.lastSampleDay === game.day, required: false },
  ];
  const visibleFoundSites = { ...game.exploration, sample: false, sampleCount: game.sampleCount || 0, ice: game.lastIceDay === game.day, beacon: game.lastBeaconDay === game.day, powerRepair: game.lastPowerRepairDay === game.day };
  const completedToday = todayTasks.filter((task) => task.done).length;
  return <div className="game-shell">
    <header className="game-topbar"><a className="brand" href="#top" aria-label="LunaBase home"><span className="brand-mark"><Moon size={20}/><span/></span><span className="brand-word">luna<span>base</span><small>MOON EXPEDITION</small></span></a><div className="game-day"><span className="live-dot"/> SOL {String(game.day).padStart(2, '0')} <i>/</i> 30</div><div className="resource-strip"><div title="Stored in the habitat oxygen tank"><Orbit size={15}/><span>BASE O₂</span><b>{Math.round(game.resources.oxygen)}</b></div><div title="Oxygen left in the spacesuit"><Footprints size={15}/><span>SUIT O₂</span><b>{Math.round(game.suitOxygen)}</b></div><div><Droplets size={15}/><span>H₂O</span><b>{Math.round(game.resources.water)}</b></div><div><Wind size={15}/><span>AIR</span><b>{Math.round(game.systems.air)}</b></div><div title="Meal portions · a 126-portion shipment arrives every 14 sols"><Leaf size={15}/><span>FOOD</span><b>{Math.round(game.resources.food)}</b></div><div><BatteryCharging size={15}/><span>POWER</span><b>{Math.round(game.resources.power)}</b></div><div className="satiety-resource" title="Crew satiety; below 50% reduces tomorrow’s stamina by 1"><Leaf size={15}/><span>SATIETY</span><b>{Math.round(game.satiety)}%</b><i><span style={{ width: `${game.satiety}%` }}/></i></div><div className="stamina-resource" title="Daily crew stamina: 5 task points; low satiety may reduce it"><HeartPulse size={15}/><span>STA</span><b>{game.stamina}/5</b><i><span style={{ width: `${game.stamina / 5 * 100}%` }}/></i></div></div><button className="base-toggle" disabled={baseMode && game.suitOxygen <= 0} onClick={() => { setBaseMode((current) => !current); setActiveTask(null); }}><Orbit size={14}/>{baseMode ? 'Return to surface' : 'Enter base'}</button><button className="game-restart" onClick={restart}><RotateCcw size={14}/> Restart</button></header>
    <main className={`game-layout ${dayTransition ? 'day-transitioning' : ''}`} id="top">
      {baseMode ? <HabitatInterior game={game} onAction={baseAction} onMiniGame={setActiveBaseTask} onLeave={() => setBaseMode(false)} lockedOutside={game.suitOxygen <= 0}/> : <><section className="game-view"><Moonwalk day={game.day} foundSites={visibleFoundSites} availableTasks={availableTasks} incident={incident} suitOxygen={game.suitOxygen} onStep={() => setGame((current) => ({ ...current, suitOxygen: Math.max(0, current.suitOxygen - 1) }))} onInteract={inspectSite} onEnterBase={() => setBaseMode(true)} disabled={Boolean(activeTask || briefingOpen || dayTransition)}/><div className="game-message"><span className="live-dot"/><span>{incident?.title || game.log[0]?.title}</span><i>{incident?.message || game.log[0]?.detail}</i></div></section>
      <aside className="game-sidebar">
        {lowResourceTip && <div className="kid-alert" role="status"><span>💡</span><p><b>Mission tip</b><small>{lowResourceTip}</small></p><button onClick={() => setBaseMode(true)}>Go to base</button></div>}
        {taskToast && <div className="task-toast" role="status">✨ {taskToast}<button onClick={() => setTaskToast('')} aria-label="Dismiss">×</button></div>}
        {game.day === 1 && !dayOneGuideDismissed && <section className="day-one-guide"><div className="day-guide-title"><span>🚀</span><div><small>DAY 1 · LIVE DEMONSTRATION</small><h2>Watch the systems run</h2></div><button onClick={() => { setDemoPlaying(false); setDayOneGuideDismissed(true); }} aria-label="Close tutorial">×</button></div><div className={`demo-machine ${demoPlaying ? 'demo-machine-running' : ''}`}><div className="demo-machine-screen"><span>{demoPlaying ? 'SYSTEM ACTIVE' : demoStep === 4 ? 'FIELD TASK COMPLETE' : 'READY TO DEMONSTRATE'}</span><b>{['Solar array stores power','Water filter recovers clean water','Oxygen generator fills base tank','Suit dock fills the EVA suit','Astronaut explores and uses supplies'][Math.max(0, demoStep)]}</b><i>{demoPlaying ? '● LIVE' : 'LUNABASE-01'}</i></div><div className="demo-resource-grid">{[['⚡ Power',demoStock.power],['💧 Raw water',demoStock.raw],['🚰 Clean water',demoStock.water],['🫧 Base O₂',demoStock.baseOxygen],['🧑‍🚀 Suit O₂',demoStock.suitOxygen],['👣 Stamina',demoStock.stamina],['🍽 Satiety',demoStock.satiety]].map(([label,value])=><div key={label}><span>{label}</span><b>{label.includes('Stamina') ? `${value}/5` : `${value}%`}</b></div>)}</div><div className="demo-machine-action">{demoPlaying ? <><span className="demo-spinner"/> {['Panels turning toward sunlight…','Filter running · power −4 · clean water +4','Electrolysis running · water + power → oxygen','Dock transferring base oxygen to suit…','Astronaut walking to a lunar task…'][demoStep]}</> : demoStep === 4 ? 'The demo used a separate practice copy. Your mission resources are unchanged.' : 'Press play to see each machine work and watch the resource numbers change.'}</div></div><small className="day-guide-rule">This is a practice run: it does not change your real mission resources.</small><div className="day-guide-buttons"><button className="day-guide-dismiss" onClick={() => { setDemoStock({ power: 45, raw: 10, water: 12, baseOxygen: 42, suitOxygen: 35, stamina: 5, satiety: 80 }); setDemoStep(-1); setDemoPlaying(true); }}>{demoPlaying ? 'Restart demo' : demoStep === 4 ? 'Replay demo' : '▶ Play full demo'}</button><button className="day-guide-dismiss secondary" onClick={() => { setDemoPlaying(false); setDayOneGuideDismissed(true); }}>Got it — start Day 1</button></div></section>}
        <section className="game-info-card"><div className="game-card-heading"><span className="info-sigil"><Wind size={17}/></span><div><small>HABITAT LIFE SUPPORT</small><h2>ECLSS info</h2></div></div><p className="eclss-lead">ECLSS keeps the crew alive by recycling and managing the habitat’s essential resources.</p>
          <div className="eclss-row"><span className="eclss-icon water"><Droplets size={15}/></span><div><b>Water</b><small>Recover used water; lunar ice can replenish reserves.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon oxygen"><Orbit size={15}/></span><div><b>Oxygen</b><small>Generate breathable oxygen from processed water.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon air"><Wind size={15}/></span><div><b>Clean air</b><small>Filter cabin air and remove contaminants.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon power"><BatteryCharging size={15}/></span><div><b>Power</b><small>Run recovery, filtration, lights and equipment.</small></div></div>
          <div className="eclss-row"><span className="eclss-icon food"><Leaf size={15}/></span><div><b>Food</b><small>Keep the crew supplied throughout the mission.</small></div></div>
        </section>
        <section className="task-card"><div className="task-heading"><div><small>TODAY’S MISSION</small><h2>Task list</h2></div><span>{completedToday}/{todayTasks.length} done</span></div><div className={`relay-status ${game.systems.comms ? 'relay-online' : ''}`}><Radio size={14}/><span>{game.systems.comms ? 'EARTH LINK ONLINE · navigation and mission support available' : 'EARTH LINK OFFLINE · restore the relay before Sol 30'}</span></div><div className="task-progress"><span style={{ width: `${completedToday / todayTasks.length * 100}%` }}/></div>{todayTasks.map((task, index) => <div className={`task-item ${task.done ? 'task-complete' : ''}`} key={task.id}><span className="task-check">{task.done ? '✓' : String(index + 1).padStart(2, '0')}</span><div><b>{task.title}</b><small>{task.required ? `TODAY’S INCIDENT · ${task.done ? 'completed' : 'available only today'} · costs 1 STA` : `${task.done ? `${game.sampleCount} collected today · ` : ''}Optional · repeatable · costs 1 STA`}</small></div></div>)}<p className="stamina-note"><Footprints size={13}/>{incident ? 'Complete today’s incident before the next Sol; sample collection is optional.' : 'No incident today · collect samples or manage base systems.'}</p>
          <button className="ration-button" onClick={rationFood} disabled={game.ended || game.stamina <= 0 || dayTransition || game.resources.food < 3 || game.satiety >= 100}><Package size={14}/> Eat a crew meal <span>−3 portions · +40 satiety · −1 STA</span></button>
        </section>
        <section className="hq-contact-card"><div className="hq-contact-heading"><span><Radio size={16}/></span><div><small>MISSION CONTROL</small><h2>NASA Headquarters contact</h2></div><b className={game.systems.comms ? 'hq-online' : ''}>{game.systems.comms ? 'UPLINK' : 'OFFLINE'}</b></div><p>{hqMessage}</p><button onClick={contactHq} disabled={!game.systems.comms || game.stamina <= 0 || dayTransition || game.ended}><Radio size={14}/> Send status report <small>−1 STA · −20 satiety</small></button>{!game.systems.comms && <small className="hq-unlock-note">Complete the Day 1 Signal Beacon task to restore communication.</small>}</section>
        <div className="crew-status-bar"><HeartPulse size={15}/><span>Crew condition</span><b>{Math.round(game.crew.reduce((sum, person) => sum + person.health, 0) / game.crew.length)}%</b><i/><Sparkles size={14}/><b>{Math.round(game.crew.reduce((sum, person) => sum + person.morale, 0) / game.crew.length)}%</b><i/><Leaf size={14}/><b>{game.satiety}%</b></div>
        <p className="game-footnote">Educational game model · all values are illustrative, not NASA specifications.</p>
      </aside></>}
    </main>
    {briefingOpen && <DayOneConversation onStart={() => setBriefingOpen(false)}/>}
    {settlementOpen && settlementGame && <SettlementReport game={settlementGame} onContinue={() => { setGame((current) => takeAction({ ...current, stamina: 5 }, 'advance')); setSettlementOpen(false); setSettlementGame(null); }}/ >}
    <MissionMinigame key={activeTask} task={activeTask} onComplete={() => completeSite(activeTask)} onClose={() => setActiveTask(null)}/>
    <MissionMinigame key={activeBaseTask} task={activeBaseTask} onComplete={completeBaseTask} onClose={() => setActiveBaseTask(null)}/>
    {dayTransition && <div className="day-transition-overlay"><div className="day-transition-card"><span>☾</span><p>SHIFT COMPLETE</p><h2>Sol {game.day} complete</h2><small>Resting the crew and preparing tomorrow's mission…</small><div className="day-transition-progress"><i/></div></div></div>}
    <MissionResult outcome={game.ended} game={game} onRestart={restart}/>
  </div>;
}
