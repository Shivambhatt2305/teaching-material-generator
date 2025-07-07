import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-topics.ts';
import '@/ai/flows/generate-teaching-content.ts';
import '@/ai/flows/generate-visual-aid.ts';
import '@/ai/flows/generate-graph.ts';
