import type { APIRoute } from 'astro';
import { puzzleCatalogue } from '../../lib/catalogue';

// The spoiler-free puzzle list the daily-newsletter function reads (research R2).
export const GET: APIRoute = () =>
  new Response(JSON.stringify(puzzleCatalogue()), {
    headers: { 'Content-Type': 'application/json' },
  });
