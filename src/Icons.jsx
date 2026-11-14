import React from 'react';

// Tiny inline icon set keeps the prototype easy to install without an icon package.
const paths = {
  ArrowDownRight: <><path d="M7 7l10 10"/><path d="M17 7v10H7"/></>,
  ArrowUpRight: <><path d="M7 17 17 7"/><path d="M7 7h10v10"/></>,
  BatteryCharging: <><rect x="3" y="7" width="17" height="10" rx="2"/><path d="M23 10v4M12 9l-2 4h4l-2 4"/></>,
  Check: <path d="m5 12 4 4L19 6"/>,
  Compass: <><circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"/></>,
  ChevronRight: <path d="m9 18 6-6-6-6"/>,
  CircleHelp: <><circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.5 1.5c-1.2 1.3-2.1 1.4-2.1 3M12 17h.01"/></>,
  Clock3: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  Droplets: <><path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/><path d="M9 15a3 3 0 0 0 3 3"/></>,
  Gauge: <><path d="M4 18a9 9 0 1 1 16 0"/><path d="m12 13 4-4M5 18h14"/></>,
  HeartPulse: <><path d="M20.8 8.6c0 5-8.8 11-8.8 11s-8.8-6-8.8-11a4.8 4.8 0 0 1 8.8-2.3 4.8 4.8 0 0 1 8.8 2.3Z"/><path d="M6 12h3l2-3 2.2 6 2-3H18"/></>,
  Footprints: <><path d="M4 16c0-2 2-3 3-3s3 1 3 3-1 4-3 4-3-2-3-4ZM14 18c0-2 2-3 3-3s3 1 3 3-1 4-3 4-3-2-3-4Z"/><path d="M8 10c-1-2-1-5 1-6s4 1 4 4-1 5-3 5M16 12c-1-2-1-5 1-6s3 1 3 4-1 4-3 4"/></>,
  Leaf: <><path d="M20 4c-9 0-15 4-15 11a5 5 0 0 0 5 5c7 0 11-7 10-16Z"/><path d="M5 20c3-5 7-8 12-11"/></>,
  Menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  Moon: <path d="M20 15A8 8 0 0 1 9 4a8.5 8.5 0 1 0 11 11Z"/>,
  Orbit: <><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-35 12 12)"/><circle cx="19" cy="7" r="1"/></>,
  Package: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></>,
  Play: <path d="m7 4 13 8-13 8V4Z"/>,
  RotateCcw: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></>,
  Radio: <><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4m-8.4 0a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/></>,
  Search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
  Shield: <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/>,
  Snowflake: <><path d="M12 2v20M4 7l16 10M4 17 20 7"/><path d="m12 2-2 2m2-2 2 2M12 22l-2-2m2 2 2-2M4 7l3 .5M4 7l1-3m15 13-3-.5m3 .5-1 3M4 17l3-.5M4 17l1 3M20 7l-3 .5m3-.5-1-3"/></>,
  Sparkles: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 14 .9 2.6L22 17.5l-2.1.8L19 21l-.9-2.7-2.1-.8 2.1-.9L19 14ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z"/></>,
  Sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  Wind: <><path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h7a3 3 0 1 1-3 3"/></>,
  Wrench: <><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4l-3 3-3-3 3-3Z"/></>,
  X: <><path d="m18 6-12 12M6 6l12 12"/></>,
};

function makeIcon(name) {
  return function Icon({ size = 24, strokeWidth = 1.8, fill = 'none', ...props }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
  };
}

export const ArrowDownRight = makeIcon('ArrowDownRight');
export const ArrowUpRight = makeIcon('ArrowUpRight');
export const BatteryCharging = makeIcon('BatteryCharging');
export const Check = makeIcon('Check');
export const Compass = makeIcon('Compass');
export const ChevronRight = makeIcon('ChevronRight');
export const CircleHelp = makeIcon('CircleHelp');
export const Clock3 = makeIcon('Clock3');
export const Droplets = makeIcon('Droplets');
export const Gauge = makeIcon('Gauge');
export const HeartPulse = makeIcon('HeartPulse');
export const Footprints = makeIcon('Footprints');
export const Leaf = makeIcon('Leaf');
export const Menu = makeIcon('Menu');
export const Moon = makeIcon('Moon');
export const Orbit = makeIcon('Orbit');
export const Package = makeIcon('Package');
export const Play = makeIcon('Play');
export const RotateCcw = makeIcon('RotateCcw');
export const Radio = makeIcon('Radio');
export const Search = makeIcon('Search');
export const Shield = makeIcon('Shield');
export const Snowflake = makeIcon('Snowflake');
export const Sparkles = makeIcon('Sparkles');
export const Sun = makeIcon('Sun');
export const Wind = makeIcon('Wind');
export const Wrench = makeIcon('Wrench');
export const X = makeIcon('X');
