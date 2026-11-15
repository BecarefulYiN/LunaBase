// Educational game score, not a NASA assessment.
const bounded=n=>Math.max(0,Math.min(100,Number.isFinite(n)?n:0));
export function missionScore(game){
 const avg=values=>values.reduce((a,b)=>a+bounded(b),0)/Math.max(1,values.length);
 const rows=[
 {label:'Mission completed',points:game.ended==='won'?30:Math.min(29,Math.floor(Math.max(0,Math.min(7,game.day-1))/7*30)),max:30,help:'Finish all seven days safely with the Earth relay restored.'},
 {label:'Science discoveries',points:['beacon','sample','ice'].filter(id=>game.exploration[id]).length*10,max:30,help:'Discover each field objective once. Repeating it does not add points.'},
 {label:'Crew care',points:Math.round(avg(game.crew.flatMap(p=>[p.health,p.morale]))*.2),max:20,help:'Keep the crew healthy and in good spirits.'},
 {label:'Supplies remaining',points:Math.round(avg(['oxygen','food','power','water'].map(id=>game.resources[id]))*.2),max:20,help:'Save air, food, power and clean water for a safe finish.'}
 ];const total=rows.reduce((sum,row)=>sum+row.points,0);
 return {rows,total,badge:game.ended!=='won'?'Keep practising':total>=85?'Moon mission star':total>=65?'Skilled explorer':'Mission finisher'};
}
