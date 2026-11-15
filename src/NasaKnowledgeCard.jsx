import React from 'react';
import { NASA_KNOWLEDGE } from './nasaKnowledge.js';
export default function NasaKnowledgeCard({ task }) {
 const card=NASA_KNOWLEDGE[task]; if(!card)return null;
 return <section className="nasa-knowledge" aria-label="NASA learning note"><p className="eyebrow">MISSION COMPLETE / DISCOVER THE SCIENCE</p><h3>{card.title}</h3><h4>What NASA reports</h4><p>{card.fact}</p><h4>Why it matters</h4><p>{card.why}</p><details><summary>What our game simplifies</summary><p>{card.boundary}</p></details><h4>Explore the original NASA sources</h4><ul>{card.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ul><small>Child-friendly paraphrase of NASA material. Checked November 15, 2026. Not a NASA endorsement.</small></section>;
}
