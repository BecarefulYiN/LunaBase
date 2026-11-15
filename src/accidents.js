// Four scripted teaching events, not real event probabilities or repair procedures.
export const ACCIDENTS = {
 cme:{title:'Solar storm: protect the crew',intro:'A solar storm warning arrived. Stay inside first. After the all-clear, check the outside relay.',fact:'NASA explains that solar storms can threaten astronauts and spacecraft. Crews may shelter and postpone spacewalks.',url:'https://science.nasa.gov/science-research/heliophysics/how-nasa-will-protect-astronauts-from-space-radiation-at-the-moon/',extraUrl:'https://spaceplace.nasa.gov/spaceweather/en/',tasks:['Stay in the shielded shelter','Read simulated all-clear','Check relay cable','Align relay antenna','Test the Earth link']},
 dust:{title:'Moon dust in the equipment',intro:'Sharp Moon dust is caught around an airlock seal. Use the enclosed service panel to clean and check it.',fact:'NASA reports that lunar dust has sharp edges, clings to surfaces, and can damage seals and clog mechanisms. It is not all glass.',url:'https://science.nasa.gov/biological-physical/what-hazards-are-caused-by-lunar-regolith/',tasks:['Isolate the service panel','Collect trapped dust','Check the seal','Test the clean system']},
 impact:{title:'Small space rock: power fault',intro:'A small impact damaged a power connection. Some stored power was lost. Repair the isolated backup circuit inside.',fact:'NASA observes meteoroid impacts on the Moon. Direct hits are unlikely, but nearby impact debris can threaten surface equipment.',url:'https://www.nasa.gov/news-release/earths-moon-hit-by-surprising-number-of-meteoroids/',tasks:['Isolate damaged circuit','Fit the spare connector','Reconnect backup circuit','Test power flow']},
 eclipse:{title:'Earth blocks the sunlight',intro:'Earth has moved between the Sun and Moon. Solar charging pauses. Use stored energy until sunlight returns.',fact:'NASA explains that a lunar eclipse happens when Earth casts its shadow on the Moon. Batteries can supply stored energy when sunlight is unavailable.',url:'https://spaceplace.nasa.gov/eclipses/en/',extraUrl:'https://www.nasa.gov/image-article/solar-arrays-international-space-station/',tasks:['Use stored battery power','Turn off spare lights','Keep life support running','Wait for simulated sunlight return']}
};
export function startAccident(game) {
 if(!game.trainingComplete || game.ended || game.accident || game.lastAccidentDay===game.day || game.day>7)return game;
 const type=['cme','dust','impact','eclipse'].find(t=>!game.accidentsDone.includes(t));if(!type)return game;
 const next=structuredClone(game);next.accident={type,step:0};next.lastAccidentDay=game.day;
 if(type==='cme')next.systems.comms=0;
 if(type==='dust')next.systems.wear=Math.min(100,next.systems.wear+15);
 if(type==='impact')next.resources.power=Math.max(1,next.resources.power-12);
 next.log=[{day:next.day,title:ACCIDENTS[type].title,detail:ACCIDENTS[type].intro,tone:'warn'},...next.log].slice(0,5);return next;
}
export function progressAccident(game,expectedType,expectedStep,inside) {
 const event=game.accident;if(!event||game.ended||event.type!==expectedType||event.step!==expectedStep)return game;
 const outside=event.type==='cme'&&event.step>=2;
 if(outside?inside||game.suitOxygen<12:!inside)return game;
 const next=structuredClone(game);next.accident.step++;
 if(next.accident.step>=ACCIDENTS[event.type].tasks.length){
  if(event.type==='cme'){next.systems.comms=100;next.suitOxygen=Math.max(0,next.suitOxygen-12);}
  if(event.type==='dust')next.systems.wear=Math.max(0,next.systems.wear-15);
  next.accidentsDone.push(event.type);next.accident=null;next.stamina=Math.max(0,next.stamina-1);
  next.log=[{day:next.day,title:'Incident resolved',detail:ACCIDENTS[event.type].title+' — normal operations can resume.',tone:'good'},...next.log].slice(0,5);
 }return next;
}
export const solarBlocked = game => ['impact','eclipse'].includes(game.accident?.type);
export const shelterRequired = game => game.accident?.type==='cme'&&game.accident.step<2;
