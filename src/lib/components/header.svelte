<script lang="ts">
  import { user, isAuthenticated, userroles } from '$store/sharedStates.svelte';
  import auth from '$services/auth-service';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import logo from '$lib/assets/logo.png';
  import type { User } from '$interfaces/user.interface';

  let mobileNavOpen = $state(false);
  let isAuth = $derived(isAuthenticated.get());
  let currentUser = $derived(user.get()) as User;
  let currentUserRoles = $derived(userroles.get());
  let inProgress = $state(false);

  async function login() {
    inProgress = true;
    const auth0Client = await auth.createClient();
    await auth.loginWithPopup(auth0Client);
    inProgress = false;
  }

  async function logout() {
    inProgress = true;
    const auth0Client = await auth.createClient();
    await auth.logout(auth0Client);
    inProgress = false;
  }
</script>

<header class:loggedin={isAuth}>
  {#if isAuth}
    <div class="logged-in-header">
      <div class="inner-box flex items-center justify-between">
        <p><strong>Herzlich Willkommen</strong> <span class="pl-2 opacity-75">{currentUser.email}</span></p>
        <button
          class="text-link-button white-link"
          onclick={() => {
            logout();
          }}>Logout</button
        >
      </div>
    </div>
  {/if}
  <div class="inner-box min-h-18">
    <div class="flex items-center space-x-2">
      <a href="/">
        <img src={logo} alt="Logo" class="h-12 w-auto rounded-full mr-2" />
      </a>
      <span class="text-xl font-bold">Catering Master</span>
    </div>

    {#if isAuth && currentUserRoles?.includes('creator')}
      {#if $page.url.pathname === '/create-catering' || $page.url.pathname === '/edit-catering'}
        <button class="btn btn-secondary" onclick={() => goto('/')}>Caterings anzeigen</button>
      {:else}
        <button class="btn btn-secondary" onclick={() => goto('/create-catering')}>Catering anlegen</button>
      {/if}
    {/if}
    {#if !isAuth}
      <button class="btn btn-secondary" onclick={() => login()}>Anmelden</button>
    {/if}
  </div>
</header>

<style lang="postcss">
  @reference '../../app.css';

  .logged-in-header {
    @apply w-full bg-primary py-1.5;
    .inner-box {
      @apply m-auto flex h-full w-full max-w-7xl items-center justify-between px-4;
      p {
        @apply text-base text-neutral-content;
      }
    }
  }

  header {
    @apply sticky top-0 z-20 bg-base-100;
    &.loggedin {
      @apply h-28;
      .inner-box {
        @apply h-auto;
      }
    }

    .inner-box {
      @apply m-auto flex h-full w-full max-w-7xl items-center justify-between px-4;
    }
  }
</style>
