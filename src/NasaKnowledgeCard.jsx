import MissionCoach from './MissionCoach.jsx';
import React from 'react';
import { NASA_KNOWLEDGE } from './nasaKnowledge.js';
export default function NasaKnowledgeCard({ task }) {
 const card=NASA_KNOWLEDGE[task]; if(!card)return null;
 return <section className="nasa-knowledge" aria-label="NASA learning note"><p className="eyebrow">YOU DID IT! / A NASA FACT</p><h3>{card.title}</h3><MissionCoach title="Nice work! Here’s why that job matters."><p>{card.simpleFact}</p><p>{card.simpleWhy}</p></MissionCoach><small>Our game is pretend practice. Its numbers are not real mission measurements.</small><details><summary>Learn more: NASA facts and game differences</summary><p>{card.fact}</p><p>{card.boundary}</p><h4>Read the NASA source</h4><ul>{card.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ul><small>NASA information rewritten in simpler words. Checked November 15, 2026. Not a NASA endorsement.</small></details></section>;
}
