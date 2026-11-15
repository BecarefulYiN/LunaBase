// Game-only patterns and frequencies; not real mission specifications.
export function createScannerSequence(random = Math.random) {
  const colors = ['blue', 'amber', 'mint'];
  return Array.from({ length: 4 }, () => colors[Math.floor(random() * colors.length)]);
}
export function createSignalChallenge(random = Math.random) {
  const targets = Array.from({ length: 2 }, () => (4 + Math.floor(random() * 13)) * 5);
  const initial = targets.map(target => {
    const choices = Array.from({length: 21}, (_, i) => i * 5).filter(value => Math.abs(value - target) >= 15 && Math.abs(value - target) <= 35);
    return choices[Math.floor(random() * choices.length)];
  });
  return { targets, initial };
}

export function createFoodChallenge(target, day, random = Math.random) {
  const scenarios = [
    {title:'Daily supply sorting', boxes:['Morning box','Midday box','Evening box'], brief:'Sort the ready-food stock into labeled boxes so the crew can find it easily.', lesson:'Clear labels and accurate inventory help crews manage limited supplies.'},
    {title:'EVA preparation', boxes:['Before EVA','After EVA','Habitat crew'], brief:'Prepare food for before and after the spacewalk, and for the crew staying inside. These packets are not for eating outside in a spacesuit.', lesson:'Mission planning includes the astronauts outside and the crew supporting them inside.'},
    {title:'Backup supply check', boxes:['Main locker','Backup locker','Portable kit'], brief:'Organize existing food into three accessible ready-supply containers. You are not receiving a shipment.', lesson:'Earth can help review a plan, but the crew must work with the supplies already onboard.'}
  ];
  const scenario = scenarios[((day-1)%3+3)%3];
  const goals=[0,0,0];
  const order=[0,1,2];
  for(let i=2;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  for(let i=0;i<target;i++) goals[i<3?order[i]:Math.floor(random()*3)]++;
  return {...scenario,goals};
}

export function createIceChallenge(random = Math.random) {
  const width = 20 + Math.floor(random()*9);
  const min = 24 + Math.floor(random()*25);
  return { min, max:min+width, speed:0.9+random()*0.6 };
}
export function createSolarChallenge(random = Math.random) {
  // Three straight couplers: horizontal connects the fixed left-to-right path.
  const rotations=Array.from({length:3},()=>Math.floor(random()*4));
  if(rotations.every(n=>n%2===0)) rotations[Math.floor(random()*3)]=1;
  return rotations;
}

export function createWaterChallenge(random = Math.random) {
  const shuffle = values => { const result = [...values]; for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];} return result; };
  const samples = shuffle([
    { dirt:'Grit', answer:'sand', explanation:'A sand bed helps trap suspended grit. This stage alone does not make water safe to drink.' },
    { dirt:'Oil traces', answer:'carbon', explanation:'Activated carbon can adsorb some organic contaminants. Real treatment depends on the contaminant and filter design.' },
    { dirt:'Dissolved salts', answer:'membrane', explanation:'A suitable desalination membrane, such as reverse osmosis, can remove dissolved salts; ordinary particle filters cannot.' }
  ]);
  const choices = shuffle([['sand','Sand bed','Suspended particles'],['carbon','Activated carbon','Some organic contaminants'],['membrane','Desalination membrane','Dissolved salts']]);
  return {samples,choices};
}
