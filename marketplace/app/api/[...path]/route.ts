import { env } from 'cloudflare:workers';
import { marketApi } from '../../../lib/api.mjs';
export const dynamic='force-dynamic';
async function handle(request:Request){if(!env.DB)return Response.json({error:'Databáza nie je dostupná.'},{status:503});return marketApi(request,{db:env.DB,bucket:env.BUCKET,userId:request.headers.get('oai-authenticated-user-id')});}
export const GET=handle;export const POST=handle;export const PUT=handle;export const PATCH=handle;export const DELETE=handle;
