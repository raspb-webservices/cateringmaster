import { PUBLIC_VITE_AUTH0_DOMAIN } from '$env/static/public'
import { PUBLIC_VITE_AUTH0_CLIENT_ID } from '$env/static/public'
import { VITE_AUTH0_CLIENT_SECRET } from '$env/static/private'
import { PUBLIC_VITE_AUTH0_AUDIENCE } from '$env/static/public'
import type { RequestHandler } from '@sveltejs/kit';

async function getToken() {
  try {
    const response = await fetch(PUBLIC_VITE_AUTH0_DOMAIN + '/oauth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: PUBLIC_VITE_AUTH0_CLIENT_ID,
        client_secret: VITE_AUTH0_CLIENT_SECRET,
        audience: PUBLIC_VITE_AUTH0_AUDIENCE,
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    return "ERROR: " + error;
  }
}

export const GET: RequestHandler = async () => {
  try {
    const response = (await getToken()) as any;
    return new Response(JSON.stringify(response.access_token));
  } catch (error) {
    return new Response(JSON.stringify(error));
  }
};
