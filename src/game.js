// All quantities are illustrative game units, not NASA mission specifications.
export const INITIAL_GAME = {
  day: 1,
  stamina: 5,
  suitOxygen: 100,
  satiety: 100,
  resources: { oxygen: 82, food: 76, power: 68, water: 54, wastewater: 12 },
  systems: { water: 72, air: 84, oxygen: 62, wear: 18, comms: 0 },
  exploration: { ice: false, sample: false, beacon: false },
  dailyFieldDone: {},
  crew: [
    { name: 'Maya Chen', role: 'Commander', health: 92, morale: 82, color: 'coral' },
    { name: 'Leo Park', role: 'Systems engineer', health: 86, morale: 74, color: 'blue' },
    { name: 'Amara Okafor', role: 'Mission scientist', health: 95, morale: 88, color: 'green' },
  ],
  log: [{ day: 1, title: 'Mission systems nominal', detail: 'Habitat checks complete. The crew is ready for the first surface survey.', tone: 'good' }],
  ended: null,
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

function evaluate(game) {
  const r = game.resources;
  if (game.crew.some((person) => person.health <= 0)) return 'failed';
  if (r.oxygen <= 0 || r.food <= 0 || r.power <= 0) return 'failed';
  if (game.day > 14) return game.exploration.beacon ? 'won' : 'failed';
  return null;
}

function appendLog(game, title, detail, tone = 'neutral') {
  return [{ day: game.day, title, detail, tone }, ...game.log].slice(0, 5);
}

export function takeAction(game, action) {
  if (game.ended) return game;
  const next = structuredClone(game);
  let message = '';
  let title = '';
  let tone = 'good';
  const r = next.resources;

  if (action === 'survey') {
    if (r.power < 10) return { ...game, log: appendLog(game, 'Not enough power', 'A surface survey needs at least 10 power units.', 'bad') };
    r.power = clamp(r.power - 10);
    next.systems.wear = clamp(next.systems.wear + 3);
    next.crew.forEach((person) => { person.morale = clamp(person.morale + 5); person.health = clamp(person.health - 1); });
    title = 'Surface survey complete';
    message = 'The crew mapped a nearby ridge. Science progress improved morale; the rover added a little wear.';
  } else if (action === 'rest') {
    next.crew.forEach((person) => { person.morale = clamp(person.morale + 12); person.health = clamp(person.health + 4); });
    title = 'Crew recovery';
    message = 'A quieter shift gave the crew time to recover and reconnect.';
  } else if (action === 'repair') {
    if (r.power < 8) return { ...game, log: appendLog(game, 'Not enough power', 'A maintenance cycle needs at least 8 power units.', 'bad') };
    r.power = clamp(r.power - 8);
    next.systems.wear = clamp(next.systems.wear - 16);
    title = 'Preventive maintenance complete';
    message = 'The crew serviced filters and seals. Equipment wear is down.';
  } else if (action === 'ration') {
    r.food = clamp(r.food + 8);
    next.crew.forEach((person) => { person.morale = clamp(person.morale - 7); });
    title = 'Ration plan adjusted';
    message = 'Stored meals were reorganized to stretch supplies. The crew would prefer a varied menu.';
    tone = 'neutral';
  } else if (action === 'advance') {
    next.day += 1;
    next.stamina = 5;
    next.dailyFieldDone = {};
    r.oxygen = clamp(r.oxygen - 7 + Math.round(next.systems.oxygen * 0.08));
    r.food = clamp(r.food - 5);
    r.power = clamp(r.power - (next.systems.comms ? 4 : 5) + (next.systems.wear < 75 ? 2 : 0));
    r.water = clamp(r.water - 3 + Math.round(next.systems.water * 0.04));
    r.wastewater = clamp((r.wastewater || 0) + 2);
    next.systems.wear = clamp(next.systems.wear + (next.systems.comms ? 2 : 3));
    next.satiety = clamp(next.satiety - 25);
    next.crew.forEach((person) => {
      person.health = clamp(person.health - (r.oxygen < 25 || r.food < 20 || next.satiety < 25 ? 8 : 1) - (next.systems.air < 30 ? 4 : 0));
      person.morale = clamp(person.morale - (next.systems.comms ? 3 : 5) - (r.food < 20 ? 3 : 0));
    });
    // Running low on power reduces system performance, creating a resource trade-off.
    if (r.power < 18) {
      next.systems.oxygen = clamp(next.systems.oxygen - 5);
      next.systems.water = clamp(next.systems.water - 4);
      next.systems.air = clamp(next.systems.air - 5);
    } else {
      next.systems.air = clamp(next.systems.air - (next.systems.wear > 75 ? 5 : 3));
    }
    title = `Sol ${next.day} systems report`;
    message = 'Daily consumption tallied. Life-support performance and crew condition updated.';
    tone = r.oxygen < 25 || r.food < 20 || r.power < 18 ? 'warn' : 'neutral';
  }

  next.log = appendLog(next, title, message, tone);
  next.ended = evaluate(next);
  if (next.ended === 'won') next.log = appendLog(next, 'Mission accomplished!', 'The crew completed a 30-day lunar expedition. Everyone made it home safe.', 'good');
  if (next.ended === 'failed') {
    const relayMissing = next.day > 14 && !next.exploration.beacon;
    next.log = appendLog(next, 'Mission ended', relayMissing ? 'The mission reached its deadline without restoring the Earth communications and navigation relay.' : 'A critical supply or crew health reached zero. Review the timeline and try a new strategy.', 'bad');
  }
  return next;
}

export function manageBase(game, action) {
  if (game.ended || game.stamina <= 0) return game;
  const next = structuredClone(game);
  const stock = next.resources;
  let title = '';
  let detail = '';
  let tone = 'good';

  if (action === 'generateOxygen') {
    if (stock.water < 6 || stock.power < 5 || stock.oxygen >= 100) return game;
    stock.water -= 6;
    stock.power -= 5;
    stock.oxygen = clamp(stock.oxygen + 18);
    title = 'Oxygen generator cycle complete';
    detail = 'Processed water and power were converted into stored habitat oxygen.';
  } else if (action === 'refillSuit') {
    const refillCost = Math.ceil(stock.oxygen / 5);
    if (stock.oxygen <= 0 || next.suitOxygen >= 100) return game;
    stock.oxygen -= refillCost;
    next.suitOxygen = 100;
    title = 'Spacesuit oxygen topped up';
    detail = 'The suit tank was refilled from the habitat oxygen reserve.';
  } else if (action === 'eat') {
    if (stock.food < 8 || next.satiety >= 100) return game;
    stock.food -= 8;
    next.satiety = clamp(next.satiety + 30);
    title = 'Meal break';
    detail = 'The crew ate a ration and recovered some satiety.';
  } else if (action === 'purifyAir') {
    if (stock.power < 5 || next.systems.air >= 100) return game;
    stock.power -= 5;
    next.systems.air = clamp(next.systems.air + 28);
    title = 'Cabin air filtered';
    detail = 'The air scrubber used stored power to improve cabin air quality.';
  } else if (action === 'purifyWater') {
    if (stock.wastewater < 5 || stock.power < 4 || stock.water >= 100) return game;
    stock.wastewater -= 5;
    stock.power -= 4;
    stock.water = clamp(stock.water + 4);
    title = 'Recovered water purified';
    detail = 'Game assumption: 5 units of collected wastewater yield 4 units of reusable clean water after filtration.';
  } else if (action === 'chargePower') {
    if (stock.power >= 100) return game;
    stock.power = clamp(stock.power + 20);
    title = 'Solar array charged habitat batteries';
    detail = 'Illustrative game action: the solar array added 20 units to stored power.';
  } else {
    return game;
  }

  next.stamina = Math.max(0, next.stamina - 1);
  next.log = appendLog(next, title, detail, tone);
  return next.stamina <= 0 ? takeAction(next, 'advance') : next;
}
