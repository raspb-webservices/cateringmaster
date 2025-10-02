import { createAuth0Client } from '@auth0/auth0-spa-js';
import { user, isAuthenticated, popupOpen, userroles } from '$store/sharedStates.svelte';
import authConfig from '$lib/config/auth-config';

async function createClient() {
  return await createAuth0Client({
    domain: authConfig.domain,
    clientId: authConfig.clientId
  });
}

async function getRoles(userid: string): Promise<string[]> {
  const userRolesResponse = await fetch('/api/auth/get/any/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'users/auth0|68da8d5288cea03f9df18a35/roles',
      body: {
        email: "markus.haertig@web.de",
        password: "12345",
        given_name:" Markus",
        family_name: "Härtig",
        connection: 'Username-Password-Authentication',
        verify_email: true,
        user_metadata: "meta"
        
      }
    })
  });

  // const userRolesResponse = await fetch('/api/auth/get/role/' + userid);

  console.log('userRolesResponse ::: ', userRolesResponse);

  if (userRolesResponse.ok) {
    const userRoleObjects = await userRolesResponse.json();
    const userRoles = [];
    if (userRoleObjects && userRoleObjects.length) {
      userRoleObjects.forEach((element: any) => {
        userRoles.push(element.name);
      });
    }
    return userRoles;
  }
  throw new Error('Could not fetch user roles from /api/userRoles/user[sub]!');
}

async function loginWithPopup(client: any, options?: any) {
  popupOpen.set(true);

  try {
    await client.loginWithPopup(options);
    const currentUser = await client.getUser();

    console.log('CURRENT USER ', currentUser);

    const currentUserRole = await getRoles(currentUser.sub);
    userroles.set(currentUserRole);
    user.set(currentUser);
    isAuthenticated.set(true);
  } catch (e) {
    console.error(e);
  } finally {
    popupOpen.set(false);
  }
}

function logout(client: any) {
  isAuthenticated.set(false);
  user.set({ email: '' });
  return client.logout({
    clientId: authConfig.clientId,
    logoutParams: {
      returnTo: authConfig.callbackUrl
    }
  });
}

async function getIdTokenClaims(client: any) {
  return await client.getIdTokenClaims();
}

async function checkAuthState(client: any) {
  try {
    const isAuth = await client.isAuthenticated();
    if (isAuth) {
      const currentUser = await client.getUser();
      user.set(currentUser);
      isAuthenticated.set(true);
    } else {
      isAuthenticated.set(false);
    }
  } catch (e) {
    console.error('Error checking auth state:', e);
    isAuthenticated.set(false);
  }
}

async function createAuth0User(userData: { email: string; password: string; givenName: string; familyName: string; user_metadata: Object }): Promise<any> {
  try {
    const auth0UserResponse = await fetch('/api/auth/post/user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        given_name: userData.givenName,
        family_name: userData.familyName,
        connection: 'Username-Password-Authentication',
        verify_email: true,
        user_metadata: userData.user_metadata
      })
    });

    return auth0UserResponse;
  } catch (error) {
    console.error('Error creating Auth0 user:', error);
    throw error;
  }
}

async function assignRole(userId: string, rolesToAssign: string[]): Promise<any> {
  try {
    const assignRoleResponse = await fetch('/api/auth/post/any', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'users/' + userId + '/roles',
        roles: rolesToAssign
      })
    });

    const assignRoleResult = await assignRoleResponse.json();

    return assignRoleResult;
  } catch (error) {
    console.error('Error creating Auth0 user:', error);
    throw error;
  }
}

async function updateMetadata(userId: string, metadata: Object): Promise<any> {
  if (userId) {
    try {
      const updateMetadataResponse = await fetch('/api/auth/patch/any', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'users/' + userId,
          user_metadata: metadata
        })
      });

      const updateMetadataResult = await updateMetadataResponse.json();

      return updateMetadataResult;
    } catch (error) {
      console.error('Error creating Auth0 user:', error);
      throw error;
    }
  } else {
    return 'error - no id';
  }
}

async function getAuth0UserByEmail(email: string): Promise<any> {
  try {
    const userResponse = await fetch('/api/auth/get/user' + encodeURIComponent(email), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const userResponseResult = await userResponse.json();
    return userResponseResult;
  } catch (error) {
    console.error('Error fetching Auth0 user by email:', error);
    throw error;
  }
}

const auth = {
  assignRole,
  createClient,
  getRoles,
  loginWithPopup,
  logout,
  getIdTokenClaims,
  checkAuthState,
  createAuth0User,
  getAuth0UserByEmail,
  updateMetadata
};

export default auth;
