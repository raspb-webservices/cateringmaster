import { PUBLIC_VITE_AUTH0_DOMAIN } from '$env/static/public';
import type { RequestHandler } from '@sveltejs/kit';

const baseURL = PUBLIC_VITE_AUTH0_DOMAIN + '/api/v2/';

async function processRequest(id: string, token: string) {
  const reqURL = baseURL + 'users/' + id + '/roles';
  try {
    const response = await fetch(reqURL, {
      method: 'GET',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + token }
    });

    if (!response.ok) {
      throw new Error('USER ROLE RESPONSE was not OK ::: ' + response);
    }
    return await response.json();
  } catch (error) {
    return 'ERROR: ' + error;
  }
}

export const GET: RequestHandler = async (event) => {
  const id = event.params.id;
  const res = await event.fetch('/api/auth/get/token');
  const token = await res.json();

  try {
    const response = (await processRequest(id, token)) as any;
    return new Response(JSON.stringify(response));
  } catch (error) {
    return new Response(JSON.stringify(error));
  }
};
