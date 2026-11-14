// All quantities are illustrative game units, not NASA mission specifications.
export const INITIAL_GAME = {
  day: 1,
  stamina: 100,
  resources: { oxygen: 82, food: 76, power: 68, water: 54 },
  systems: { water: 72, air: 84, oxygen: 62, wear: 18 },
  exploration: { ice: false, sample: false, beacon: false },
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
  if (game.day >= 30) return 'won';
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
    r.oxygen = clamp(r.oxygen - 7 + Math.round(next.systems.oxygen * 0.08));
    r.food = clamp(r.food - 5);
    r.power = clamp(r.power - 6 + (r.power > 20 ? 2 : 0));
    r.water = clamp(r.water - 3 + Math.round(next.systems.water * 0.04));
    next.systems.wear = clamp(next.systems.wear + 2);
    next.crew.forEach((person) => {
      person.health = clamp(person.health - (r.oxygen < 25 || r.food < 20 ? 8 : 1) - (next.systems.air < 30 ? 4 : 0));
      person.morale = clamp(person.morale - 3 - (r.food < 20 ? 3 : 0));
    });
    // Running low on power reduces system performance, creating a resource trade-off.
    if (r.power < 18) {
      next.systems.oxygen = clamp(next.systems.oxygen - 5);
      next.systems.water = clamp(next.systems.water - 4);
      next.systems.air = clamp(next.systems.air - 5);
    } else {
      next.systems.air = clamp(next.systems.air - (next.systems.wear > 75 ? 4 : 1));
    }
    title = `Sol ${next.day} systems report`;
    message = 'Daily consumption tallied. Life-support performance and crew condition updated.';
    tone = r.oxygen < 25 || r.food < 20 || r.power < 18 ? 'warn' : 'neutral';
  }

  next.log = appendLog(next, title, message, tone);
  next.ended = evaluate(next);
  if (next.ended === 'won') next.log = appendLog(next, 'Mission accomplished!', 'The crew completed a 30-day lunar expedition. Everyone made it home safe.', 'good');
  if (next.ended === 'failed') next.log = appendLog(next, 'Mission ended', 'A critical supply or crew health reached zero. Review the timeline and try a new strategy.', 'bad');
  return next;
}
