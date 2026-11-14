import React, { useEffect, useMemo, useState } from 'react';
import { BatteryCharging, Droplets, Footprints, Gauge, HeartPulse, Leaf, Moon, Orbit, Radio, Shield, Sun, Wind, Wrench } from './Icons.jsx';

const STATIONS = [
  { id: 'water', title: 'Water recovery & purifier', icon: Droplets, x: 25, y: 30 },
  { id: 'oxygen', title: 'Oxygen generator', icon: Orbit, x: 72, y: 30 },
  { id: 'galley', title: 'Crew galley', icon: Leaf, x: 28, y: 72 },
  { id: 'air', title: 'Clean air scrubber', icon: Wind, x: 48, y: 72 },
  { id: 'solar', title: 'Solar power console', icon: Sun, x: 72, y: 72 },
  { id: 'suit', title: 'Suit recharge dock', icon: Footprints, x: 50, y: 48 },
];

function GaugeRow({ label, value, color }) {
  return <div className="base-gauge"><div><span>{label}</span><b>{Math.round(value)}%</b></div><i><span className={color} style={{ width: `${value}%` }} /></i></div>;
}

function ResourceReadout({ icon: Icon, label, value, unit = '%', tone = 'mint', progress = value }) {
  const safeProgress = Math.max(0, Math.min(100, progress));
  return <div className="base-resource-readout"><div className="base-resource-readout-top"><span className={`base-resource-icon ${tone}`}><Icon size={15}/></span><b>{label}</b><strong>{Math.round(value)}{unit}</strong></div><div className="base-resource-track"><i className={tone} style={{ width: `${safeProgress}%` }}/></div></div>;
}

function DailyTaskList({ day, tasks = [], completed = 0, commsOnline }) {
  return <section className="habitat-daily-task-card"><div className="habitat-daily-task-heading"><div><small>SOL {String(day).padStart(2,'0')} · TODAY</small><h2>Daily task list</h2></div><b>{completed}/{tasks.length}</b></div><div className={`habitat-relay-status ${commsOnline?'relay-online':''}`}><Radio size={14}/><span>{commsOnline?'EARTH LINK ONLINE · navigation and mission support available':'EARTH LINK OFFLINE · restore the relay by Sol 14'}</span></div><div className="habitat-task-progress"><span style={{width:`${tasks.length?completed/tasks.length*100:0}%`}}/></div><div className="habitat-daily-task-items">{tasks.map((task,index)=><article className={`habitat-daily-task-item ${task.done?'task-complete':''}`} key={task.id}><span className="habitat-task-check">{task.done?'✓':String(index+1).padStart(2,'0')}</span><div><b>{task.title}</b><small>{task.note}</small></div></article>)}</div><p className="habitat-task-footnote">Field and base tasks use 1 stamina. At 0, the next Sol begins.</p></section>;
}

export default function HabitatInterior({ game, onAction, onMiniGame, onLeave, lockedOutside = false, guideStation = null, guideTaskTitle = '', onGuideSeen, dailyTasks = [], dailyProgress = 0 }) {
  const [running, setRunning] = useState(null);
  const [walker, setWalker] = useState({ x: 50, y: 53 });
  const [selected, setSelected] = useState(null);
  const { resources, systems } = game;
  const near = useMemo(() => STATIONS.map((station) => ({ ...station, distance: Math.hypot(station.x - walker.x, station.y - walker.y) })).filter((station) => station.distance < 18).sort((a,b)=>a.distance-b.distance)[0] || null, [walker]);
  const active = STATIONS.find((station) => station.id === selected) || STATIONS.find((station) => station.id === guideStation) || near || null;
  const guideTarget = STATIONS.find((station) => station.id === guideStation) || null;
  const guideDistance = guideTarget ? Math.hypot(guideTarget.x - walker.x, guideTarget.y - walker.y) : Infinity;
  const guideArrived = guideDistance < 18;
  useEffect(() => {
    if (guideStation && onGuideSeen) onGuideSeen(`station-${guideStation}`);
  }, [guideStation, onGuideSeen]);
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setTimeout(() => { onAction(running.action); setRunning(null); }, 1300);
    return () => window.clearTimeout(timer);
  }, [running, onAction]);
  useEffect(() => {
    const onKey = (event) => {
      if (['INPUT','TEXTAREA','SELECT'].includes(event.target?.tagName) || event.target?.isContentEditable) return;
      const directions = { ArrowUp:[0,-7], w:[0,-7], W:[0,-7], ArrowDown:[0,7], s:[0,7], S:[0,7], ArrowLeft:[-7,0], a:[-7,0], A:[-7,0], ArrowRight:[7,0], d:[7,0], D:[7,0] };
      const delta = directions[event.key];
      if (delta) { event.preventDefault(); setWalker((p)=>({x:Math.max(7,Math.min(93,p.x+delta[0])),y:Math.max(17,Math.min(83,p.y+delta[1]))})); setSelected(null); }
      if ((event.key==='e'||event.key==='E'||event.key===' ') && near) { event.preventDefault(); setSelected(near.id); }
      if (event.key==='Escape') setSelected(null);
    };
    window.addEventListener('keydown',onKey); return ()=>window.removeEventListener('keydown',onKey);
  }, [near]);
  const oxygenCost = Math.ceil(resources.oxygen / 5);
  const averageHealth = game.crew.reduce((sum, person) => sum + person.health, 0) / game.crew.length;
  const averageMorale = game.crew.reduce((sum, person) => sum + person.morale, 0) / game.crew.length;
  const panelContent = active ? {
    water: { text:'Clean used water so it can be reused and turned into oxygen.', gauge:['USED WATER',resources.wastewater,'blue'], flow:'5 used water + 4 power → 4 clean water', button:'Play filter calibration', action:()=>onMiniGame('purifyWater'), disabled:resources.wastewater<5||resources.power<4||resources.water>=100 },
    oxygen: { text:'Use clean water and power to fill the habitat oxygen tank.', gauge:['BASE OXYGEN',resources.oxygen,'violet'], flow:'6 clean water + 5 power → 18 base O₂', button:running?.id==='oxygen'?'Generating…':'Run oxygen generator', action:()=>setRunning({action:'generateOxygen',id:'oxygen'}), disabled:resources.water<6||resources.power<5||resources.oxygen>=100||Boolean(running) },
    galley: { text:'A meal raises crew satiety. Keep it above 50% to protect tomorrow’s stamina.', gauge:['CREW SATIETY',game.satiety,'amber'], flow:`${Math.round(resources.food)} food portions in storage`, button:'Eat a crew meal', action:()=>onAction('eat'), disabled:resources.food<8||game.satiety>=100 },
    air: { text:'The scrubber uses power to improve the air inside the habitat.', gauge:['CABIN AIR',systems.air,'mint'], flow:'5 power → +28 clean air', button:running?.id==='air'?'Filtering…':'Run air scrubber', action:()=>setRunning({action:'purifyAir',id:'air'}), disabled:resources.power<5||systems.air>=100||Boolean(running) },
    solar: { text:'Align the solar couplers to send sunlight into the battery bank.', gauge:['STORED POWER',resources.power,'amber'], flow:'Successful alignment → +20 power', button:'Play solar alignment', action:()=>onMiniGame('chargePower'), disabled:resources.power>=100 },
    suit: { text:'Transfer oxygen from the base tank into your exploration suit.', gauge:['SUIT OXYGEN',game.suitOxygen,'blue'], flow:`One recharge fills suit to 100% · −${oxygenCost} base O₂`, button:running?.id==='suit'?'Filling suit…':'Refill suit to 100%', action:()=>setRunning({action:'refillSuit',id:'suit'}), disabled:resources.oxygen<=0||game.suitOxygen>=100||Boolean(running) },
  }[active.id] : null;
  const Icon = active?.icon;
  return <section className="habitat-interior habitat-walk-layout">
    <div className="base-room-heading"><div><p className="eyebrow">LUNABASE-01 · HABITAT INTERIOR</p><h1>Walk around the base</h1><p>Go near a station and press E. Its guide and controls will appear on the right.</p></div><button className="return-surface-button" onClick={onLeave} disabled={lockedOutside}><Moon size={15}/> Return to surface</button></div>
    {lockedOutside&&<div className="suit-oxygen-alert oxygen-critical"><Footprints size={18}/><span><b>Suit oxygen empty</b><small>Refill the suit at the dock before returning outside.</small></span></div>}
    <div className="habitat-explorer"><aside className="habitat-resource-panel"><div className="base-resource-panel-heading"><span><Gauge size={18}/></span><div><small>MISSION READOUT</small><h2>All resources</h2></div></div><p className="base-resource-intro">Live supplies and crew status.</p><DailyTaskList day={game.day} tasks={dailyTasks} completed={dailyProgress} commsOnline={Boolean(systems.comms)}/><div className="base-resource-section-title">LIFE SUPPORT & SUPPLIES</div><ResourceReadout icon={Orbit} label="Base oxygen" value={resources.oxygen} tone="violet"/><ResourceReadout icon={Footprints} label="Suit oxygen" value={game.suitOxygen} tone="blue"/><ResourceReadout icon={Droplets} label="Clean water" value={resources.water} unit=" u" tone="blue"/><ResourceReadout icon={Droplets} label="Used water" value={resources.wastewater} unit=" u" tone="amber"/><ResourceReadout icon={Wind} label="Clean air" value={systems.air} tone="mint"/><ResourceReadout icon={BatteryCharging} label="Stored power" value={resources.power} tone="amber"/><ResourceReadout icon={Leaf} label="Food supply" value={resources.food} unit=" portions" tone="green"/><div className="base-resource-section-title">CREW & EQUIPMENT</div><ResourceReadout icon={HeartPulse} label="Crew health" value={averageHealth} tone="rose"/><ResourceReadout icon={HeartPulse} label="Crew morale" value={averageMorale} tone="mint"/><ResourceReadout icon={Leaf} label="Crew satiety" value={game.satiety} tone="amber"/><ResourceReadout icon={Wrench} label="Equipment wear" value={systems.wear} tone="rose"/><ResourceReadout icon={Footprints} label="Daily stamina" value={game.stamina} unit=" / 5" progress={game.stamina*20} tone="blue"/></aside><div className="habitat-walk-world" aria-label="Walkable habitat interior"><div className="hab-wall-window"><i/><span>MOON VIEW</span></div><div className="hab-room-pipe"/><div className="hab-room-floor"/><div className="hab-room-status">{running?'SYSTEM RUNNING':'HABITAT · SOL '+String(game.day).padStart(2,'0')}</div>{guideTarget&&<><svg className="mission-guide-route habitat-guide-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="habitat-guide-arrow" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z"/></marker></defs><path className="mission-guide-route-shadow" d={`M ${walker.x} ${walker.y} L ${guideTarget.x} ${guideTarget.y}`}/><path className="mission-guide-route-line" d={`M ${walker.x} ${walker.y} L ${guideTarget.x} ${guideTarget.y}`} markerEnd="url(#habitat-guide-arrow)"/></svg><div className={`mission-guide-card habitat-guide-card ${guideArrived?'guide-arrived':''}`}><span className="mission-guide-icon">{guideArrived?'✓':'➜'}</span><div><small>DAY {game.day} · BASE TASK</small><b>{guideArrived?`At ${guideTarget.title}! Press E`: `Follow the light to ${guideTarget.title}`}</b><i>{guideArrived?guideTaskTitle:'Use WASD or arrow keys to get there.'}</i></div></div></>}
      {STATIONS.map((station)=>{const StationIcon=station.icon;const highlighted=near?.id===station.id;const isGuide=guideTarget?.id===station.id;return <button key={station.id} className={`hab-station station-${station.id} ${highlighted?'station-near':''} ${selected===station.id?'station-selected':''} ${isGuide?'station-task-target':''}`} style={{left:`${station.x}%`,top:`${station.y}%`}} onClick={()=>setSelected(station.id)}><span><StationIcon size={23}/></span><b>{station.title}</b>{highlighted&&<i>E</i>}</button>})}
      <div className="hab-astronaut" style={{left:`${walker.x}%`,top:`${walker.y}%`}}><span>🧑‍🚀</span><small>YOU</small></div><div className="hab-movement-help"><b>MOVE</b> WASD / arrows <i>·</i> <b>USE</b> E</div>
      <div className="hab-dpad"><button onClick={()=>setWalker(p=>({...p,y:Math.max(17,p.y-7)}))}>▲</button><button onClick={()=>setWalker(p=>({...p,x:Math.max(7,p.x-7)}))}>◀</button><button onClick={()=>setWalker(p=>({...p,y:Math.min(83,p.y+7)}))}>▼</button><button onClick={()=>setWalker(p=>({...p,x:Math.min(93,p.x+7)}))}>▶</button></div>
    </div><aside className="habitat-info-panel"><div className="hab-info-heading"><small>NEARBY STATION</small>{active?<><span className="hab-info-icon"><Icon size={24}/></span><h2>{active.title}</h2></>:<><span className="hab-info-icon"><Orbit size={24}/></span><h2>Choose a station</h2></>}</div>{panelContent?<><p>{panelContent.text}</p><GaugeRow label={panelContent.gauge[0]} value={panelContent.gauge[1]} color={panelContent.gauge[2]}/><div className="hab-info-flow">{panelContent.flow}</div><button className="base-action-button" onClick={panelContent.action} disabled={panelContent.disabled||game.stamina<=0}>{panelContent.button}</button></>:<><p>Use WASD or the arrow keys to walk. When a station lights up, press E to see what it does and operate it.</p><div className="hab-info-flow">Power → water & air systems → oxygen → spacesuit</div></>}<div className="hab-info-resources"><span>POWER <b>{Math.round(resources.power)}</b></span><span>BASE O₂ <b>{Math.round(resources.oxygen)}</b></span><span>SUIT O₂ <b>{Math.round(game.suitOxygen)}%</b></span></div>{game.suitOxygen<100&&active?.id!=='suit'&&<button className="quick-suit-refill" onClick={()=>setRunning({action:'refillSuit',id:'quickSuit'})} disabled={resources.oxygen<=0||game.stamina<=0||Boolean(running)}><Footprints size={17}/><span><b>{running?.id==='quickSuit'?'Filling suit…':'Fill suit oxygen to 100%'}</b><small>Uses {oxygenCost} base O₂</small></span></button>}<div className="hab-info-tip"><Shield size={15}/><span>Each completed operation uses 1 stamina.</span></div></aside></div>
  </section>;
}
