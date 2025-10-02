import { PUBLIC_VITE_AUTH0_DOMAIN } from '$env/static/public';
import type { RequestHandler } from '@sveltejs/kit';

const baseURL = PUBLIC_VITE_AUTH0_DOMAIN + '/api/v2/';

async function processRequest(url: string, token: string) {
  try {
    const response = await fetch(baseURL + url, {
      method: 'GET',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + token }
    });

    if (!response.ok) {
      throw new Error('AUTH RESPONSE was not OK ::: ' + response);
    }
    return await response.json();
  } catch (error) {
    return 'ERROR: ' + error;
  }
}

export const POST: RequestHandler = async ({ request, fetch }) => {
  const requestObject = await request.json();
  const res = await fetch('/api/auth/get/token');
  const token = await res.json();
  try {
    const response = (await processRequest(requestObject.url, token)) as any;
    return new Response(JSON.stringify(response));
  } catch (error) {
    return new Response(JSON.stringify(error));
  }
};
