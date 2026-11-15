import MissionCoach from './MissionCoach.jsx';
import React from 'react';
export const TRAINING_STEPS = [
 {title:'Hi, explorer! Try a few steps',text:'Press W, A, S, D or an arrow key. On a touch screen, tap an arrow below the map.',why:'Moving outside uses a little suit air.'},
 {title:'Let’s find the purple beacon',text:'Follow the glowing line. Go close to the purple marker, then press E or tap Investigate.',why:'The beacon connects your team with Earth.',site:'beacon'},
 {title:'Help me reconnect our Earth link',text:'Start the mini-game. Use + and − to match BOTH target numbers. Lock the signal, read the NASA fact, then confirm.',why:'Ground teams can help when they receive your messages.',site:'beacon'},
 {title:'Good work! Let’s go inside',text:'Follow the line to the base. Press R near it, or tap Enter base at the top.',why:'The base has air, water and equipment to support you.',home:true},
 {title:'Let’s fill your suit with air',text:'Follow the line to the Suit recharge dock. Press E or tap it. Choose Refill suit to 100%.',why:'Your suit uses air from the base tank.',station:'suit'},
 {title:'Help me keep our cabin air clean',text:'Go to Clean air scrubber. Press E or tap it, then choose Run air scrubber.',why:'The crew needs clean air inside the base.',station:'air'},
 {title:'Let’s save some water',text:'Go to Water recovery & purifier. Play filter calibration. Match each sample, read the fact, then finish.',why:'Cleaning used water helps the crew reuse it.',station:'water'},
 {title:'Let’s give our machines some power',text:'Go to Solar power console. Play solar alignment. Turn the pieces into a connected line, then finish.',why:'The equipment needs stored power.',station:'solar'},
 {title:'Come with me — back to the surface',text:'Tap Return to surface. Look for Earth-assisted food mission on the task panel.',why:'Next you will practise planning with Earth.'},
 {title:'Let’s pack our food carefully',text:'Open Earth-assisted food mission. Send the report, fill each box to its target, check the boxes, then store supplies.',why:'You move existing food. A radio does not send new food.'},
 {title:'You did it, explorer!',text:'You finished the guided jobs! Keep the team safe through Day 7. Follow the Daily task list for your next mission. Eat when hungry and watch your suit air.',why:'You can reopen this guide with the Help button.'}
];
export default function GuidedTraining({step,onSkip,onDone,baseMode}) {const info=TRAINING_STEPS[step];return <details className="guided-training compact-guide" aria-label="Step-by-step mission guide"><summary><span>🎧 Coach • Step {step+1}/{TRAINING_STEPS.length}: <b>{info.title}</b></span><small>Tap for instructions</small></summary><MissionCoach title="Let’s do this together!"><span className="eyebrow">YOUR GUIDE • {step+1} / {TRAINING_STEPS.length}</span><h2>{info.title}</h2><p>{info.station&&!baseMode?'Tap Enter base to continue this step. ':''}{info.text}</p><small>{info.why}</small></MissionCoach><div>{step===10?<button onClick={onDone}>I am ready!</button>:<span className="guide-wait">Complete this action to continue</span>}<button onClick={onSkip}>Close guide</button></div></details>;}
