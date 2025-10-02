import { PUBLIC_VITE_AUTH0_DOMAIN } from '$env/static/public'
import { PUBLIC_VITE_AUTH0_CLIENT_ID } from '$env/static/public'
import { PUBLIC_VITE_AUTH0_CALLBACK_URL } from '$env/static/public'
import { PUBLIC_VITE_AUTH0_AUDIENCE } from '$env/static/public'

interface AuthConfig {
  domain: string;
  clientId: string;
  callbackUrl?: string;
  audience?: string;
}

const authConfig: AuthConfig = {
  domain: PUBLIC_VITE_AUTH0_DOMAIN || '',
  clientId: PUBLIC_VITE_AUTH0_CLIENT_ID || '',
  callbackUrl: PUBLIC_VITE_AUTH0_CALLBACK_URL || '',
  audience: PUBLIC_VITE_AUTH0_AUDIENCE || ''
};

// Validierung hinzufügen
if (!authConfig.domain || !authConfig.clientId) {
  console.error('Auth0 Konfiguration fehlt! Bitte Environment Variables setzen.');
}

export default authConfig;
