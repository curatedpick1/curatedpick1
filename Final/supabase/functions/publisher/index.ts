import { createHandler } from '../_shared/handler.ts';
Deno.serve(createHandler(name => Deno.env.get(name) || ''));
