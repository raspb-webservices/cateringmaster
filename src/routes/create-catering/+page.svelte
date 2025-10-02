<script lang="ts">
  import { goto } from '$app/navigation';
  import { user, isAuthenticated, userroles } from '$store/sharedStates.svelte';
  import { onMount, tick } from 'svelte';
  import { Carta, MarkdownEditor } from 'carta-md';
  import { emoji } from '@cartamd/plugin-emoji';
  import { slash } from '@cartamd/plugin-slash';
  import { code } from '@cartamd/plugin-code';
  import 'carta-md/default.css';
  import { uploadMultipleAssetsWithDelay, publishMultipleAssets } from '$lib/helper/uploadAsset';
  import auth from '$services/auth-service';

  async function login() {
    const auth0Client = await auth.createClient();
    await auth.loginWithPopup(auth0Client);
  }

  const cartaDescription = new Carta({
    sanitizer: false,
    extensions: [emoji(), slash(), code()]
  });
  const cartaRemarks = new Carta({
    sanitizer: false,
    extensions: [emoji(), slash(), code()]
  });
  const cartaClient = new Carta({
    sanitizer: false,
    extensions: [emoji(), slash(), code()]
  });
  const cartaFlow = new Carta({
    sanitizer: false,
    extensions: [emoji(), slash(), code()]
  });

  let isAuth = $derived(isAuthenticated.get());
  let currentUserRoles = $derived(userroles.get());
  let authorized = $derived(isAuth && currentUserRoles.includes('creator'));

  let title = $state('');
  let description = $state('');
  let remarks = $state('');
  let client = $state('');
  let specialWishes = $state('');
  let flow = $state('');
  let slug = $derived(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .trim()
  );
  let place = $state('');
  let offeringCreated = $state(false);
  let numberOfPersons = $state(1);
  let dateString = $state('');
  let date = $derived(new Date(dateString));
  let cateringType = $state(''); // Dropdown
  let cateringStyle = $state(''); // Dropdown
  let additionalServices = $state([]); // Multi-select
  let endTime = $state('');
  let startTime = $state('');
  let end = $derived(new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(endTime.slice(0, 2)), Number(endTime.slice(-2))));
  let start = $derived(new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(startTime.slice(0, 2)), Number(startTime.slice(-2))));

  // State for file uploads
  let selectedFiles = $state<File[]>([]);
  let uploadedAssetIds = $state<string[]>([]);

  // State for messages and loading
  let successMessage = $state<string | null>(null);
  let errorMessage = $state<string | null>(null);
  let isLoading = $state(false);
  let uploadProgressMessage = $state<string>('');

  // Dummy data for dropdowns and multi-select for demonstration
  const cateringTypes = [
    { id: 'wedding', name: 'Hochzeitsfeier' },
    { id: 'party', name: 'Party' },
    { id: 'meeting', name: 'Geschäftsmeeting' },
    { id: 'businessEvent', name: 'Geschäftsveranstaltung' },
    { id: 'conference', name: 'Konferenz' },
    { id: 'other', name: 'Etwas anderes' }
  ];
  const cateringStyles = [
    { id: 'buffet', name: 'Buffet' },
    { id: 'liveCooking', name: 'Live Cooking' },
    { id: 'fingerfood', name: 'Finger Foood' },
    { id: 'veggie', name: 'Vegetarisch' },
    { id: 'vegan', name: 'Vegan' },
    { id: 'other', name: 'Etwas anderes' }
  ];
  const allAdditionalServices = [
    { id: 'drinks', name: 'Getränke' },
    { id: 'staff', name: 'Zusätzliches Personal' },
    { id: 'dishes', name: 'Geschirr und Besteck' },
    { id: 'furniture', name: 'Möbiliar' },
    { id: 'cleaning', name: 'Reinigungsservice' },
    { id: 'other', name: 'Etwas anderes' }
  ];

  onMount(async () => {});

  async function handleSubmit() {
    isLoading = true;
    successMessage = null;
    errorMessage = null;

    try {
      // 1. Upload files first
      if (selectedFiles.length > 0) {
        uploadProgressMessage = 'Starte Dateiuploads...';
        const newAssetIds = await uploadMultipleAssetsWithDelay(
          selectedFiles,
          2000, // 2-second delay between uploads
          (message, current, total, assetId) => {
            uploadProgressMessage = `(${current}/${total}) ${message}`;
            if (assetId && !uploadedAssetIds.includes(assetId)) {
              // Ensure unique IDs and trigger reactivity
              uploadedAssetIds = [...uploadedAssetIds, assetId];
            }
          }
        );
        if (newAssetIds.includes('error')) {
          throw new Error('Einige Dateien konnten nicht hochgeladen oder verarbeitet werden.');
        }
        uploadedAssetIds = newAssetIds;
      }

      // 2. Prepare catering data for submission
      const cateringData = {
        title,
        specialWishes,
        slug,
        remarks,
        place,
        offeringCreated,
        numberOfPersons,
        description,
        date,
        flow,
        client,
        cateringType,
        cateringStyle,
        additionalServices,
        end,
        start,
        relatedAssets: uploadedAssetIds.map((id) => ({ id })) // Link uploaded assets
      };

      // 3. Submit catering data to the local API
      uploadProgressMessage = 'Sende Catering-Daten...';
      const response = await fetch('/api/events/post', {
        method: 'POST',
        body: JSON.stringify(cateringData)
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Fehler beim Erstellen des Caterings.');
      }

      const responseBody = await response.json();
      const cateringId = responseBody.data.id; // Assuming the API returns the created catering's ID

      successMessage = 'Catering erfolgreich erstellt. Bereite Veröffentlichung vor...';
      uploadProgressMessage = 'Warte vor dem Veröffentlichen...';
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds

      // 4. Publish assets
      if (uploadedAssetIds.length > 0) {
        uploadProgressMessage = 'Veröffentliche hochgeladene Assets...';
        const publishedIds = await publishMultipleAssets(uploadedAssetIds, (message, current, total) => {
          uploadProgressMessage = `(${current}/${total}) ${message}`;
        });
        if (publishedIds.length !== uploadedAssetIds.length) {
          console.warn('Nicht alle Assets konnten veröffentlicht werden.');
        }
      }

      // 5. Publish the catering event
      uploadProgressMessage = 'Veröffentliche Catering-Eintrag...';
      const publishCateringResponse = await fetch(`/api/events/publish/${cateringId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!publishCateringResponse.ok) {
        const errorBody = await publishCateringResponse.json();
        throw new Error(errorBody.error || 'Fehler beim Veröffentlichen des Caterings.');
      }

      successMessage = 'Catering und alle zugehörigen Assets erfolgreich erstellt und veröffentlicht!';
      selectedFiles = []; // Clear files after successful upload
      uploadedAssetIds = []; // Clear asset IDs
      uploadProgressMessage = '';
      await tick(); // Ensure DOM is updated before navigating
      goto('/'); // Redirect to homepage or event list
    } catch (e: any) {
      errorMessage = e.message || 'Ein unerwarteter Fehler ist aufgetreten.';
      successMessage = null;
      console.error('Submission error:', e);
    } finally {
      isLoading = false;
      uploadProgressMessage = '';
    }
  }
</script>

<div class="spacer"></div>
<div class="container mx-auto max-w-2xl p-4">
  {#if authorized}
    <h1 class="mb-6 text-center text-3xl font-bold">Neues Catering anlegen</h1>

    {#if successMessage}
      <div role="alert" class="mb-4 alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"
          ><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg
        >
        <span>{successMessage}</span>
      </div>
    {/if}

    {#if errorMessage}
      <div role="alert" class="mb-4 alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg
        >
        <span>{errorMessage}</span>
      </div>
    {/if}

    {#if isLoading && uploadProgressMessage}
      <div role="alert" class="mb-4 alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="h-6 w-6 shrink-0 stroke-current"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16V9m2 2V9m-2 7H9m0 0H7m2 0H5m-1 4h14a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"
          ></path></svg
        >
        <span>{uploadProgressMessage}</span>
      </div>
    {/if}

    <form
      onsubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      class="space-y-4 rounded-lg bg-base-100 p-6 shadow-lg"
    >
      <div class="inner-form" class:collapsed={isLoading}>
        <!-- Title -->
        <div>
          <label for="title" class="label">
            <span class="label-text">Titel</span>
          </label>
          <input type="text" id="title" bind:value={title} class="input-bordered input w-full" required />
          {#if slug != ''}
            <div class="px-2.5 text-right text-sm text-accent">{slug}</div>
          {/if}
        </div>

        <!-- Number of Persons -->
      <div>
        <label for="numberOfPersons" class="label">
          <span class="label-text">Anzahl der Personen</span>
        </label>
        <input type="number" id="numberOfPersons" bind:value={numberOfPersons} min="1" class="input-bordered input w-full" required />
      </div>

      <!-- Date -->
      <div>
        <label for="date" class="label">
          <span class="label-text">Datum des Events</span>
        </label>
        <input type="date" id="date" bind:value={dateString} class="input-bordered input w-full" required />
      </div>

      <!-- Startzeit -->
      <div>
        <label for="start" class="label">
          <span class="label-text">Startzeit</span>
        </label>
        <input type="time" id="start" bind:value={startTime} class="input-bordered input w-full" required />
      </div>

      <!-- Endzeit -->
      <div>
        <label for="end" class="label">
          <span class="label-text">Endzeit</span>
        </label>
        <input type="time" id="end" bind:value={endTime} class="input-bordered input w-full" required />
      </div>

      <!-- Place -->
      <div>
        <label for="place" class="label">
          <span class="label-text">Ort</span>
        </label>
        <input type="text" id="place" bind:value={place} class="input-bordered input w-full" required />
      </div>

      <!-- Catering Type (Dropdown) -->
      <div>
        <label for="cateringType" class="label">
          <span class="label-text">Catering Typ</span>
        </label>
        <select id="cateringType" bind:value={cateringType} class="select-bordered select w-full" required>
          <option value="" disabled>Wähle einen Typ</option>
          {#each cateringTypes as type}
            <option value={type.id}>{type.name}</option>
          {/each}
        </select>
      </div>

      <!-- Catering Style (Dropdown) -->
      <div>
        <label for="cateringStyle" class="label">
          <span class="label-text">Catering Stil</span>
        </label>
        <select id="cateringStyle" bind:value={cateringStyle} class="select-bordered select w-full" required>
          <option value="" disabled>Wähle einen Stil</option>
          {#each cateringStyles as style}
            <option value={style.id}>{style.name}</option>
          {/each}
        </select>
      </div>

      <!-- Additional Services (Multi-select) -->
      <div>
        <label class="label">
          <span class="label-text">Zusätzliche Services</span>
        </label>
        <div class="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {#each allAdditionalServices as service}
            <div class="form-control">
              <label class="label cursor-pointer justify-start">
                <input type="checkbox" class="checkbox checkbox-primary" value={service.id} bind:group={additionalServices} />
                <span class="label-text ml-2">{service.name}</span>
              </label>
            </div>
          {/each}
        </div>
      </div>

      <!-- Description (Markdown Editor) -->
      <div>
        <label for="description" class="label">
          <span class="label-text">Beschreibung</span>
        </label>
        <MarkdownEditor bind:value={description} mode="tabs" carta={cartaDescription} />
      </div>

      <!-- Ablauf (Markdown Editor) -->
      <div>
        <label for="description" class="label">
          <span class="label-text">Ablauf</span>
        </label>
        <MarkdownEditor bind:value={flow} mode="tabs" carta={cartaFlow} />
      </div>

      <!-- Client (Markdown Editor) -->
      <div>
        <label for="client" class="label">
          <span class="label-text">Kunde</span>
        </label>
        <MarkdownEditor bind:value={client} mode="tabs" carta={cartaClient} />
      </div>

      <!-- Remarks (Markdown Editor) -->
      <div>
        <label for="remarks" class="label">
          <span class="label-text">Bemerkungen</span>
        </label>
        <MarkdownEditor bind:value={remarks} mode="tabs" carta={cartaRemarks} />
      </div>

      <!-- Special Wishes -->
      <div>
        <label for="specialWishes" class="label">
          <span class="label-text">Besondere Wünsche</span>
        </label>
        <textarea id="specialWishes" bind:value={specialWishes} class="textarea-bordered textarea h-24 w-full" placeholder="Gibt es besondere Wünsche?"
        ></textarea>
      </div>

      <!-- Offering Created Checkbox -->
      <div class="form-control">
        <label class="label cursor-pointer justify-start">
          <input type="checkbox" class="checkbox checkbox-primary" bind:checked={offeringCreated} />
          <span class="label-text ml-2">Angebot erstellt</span>
        </label>
      </div>

      <!-- File Upload Field -->
      <div>
        <label for="fileUpload" class="label">
          <span class="label-text">Datei hochladen</span>
        </label>
        <input
          type="file"
          id="fileUpload"
          class="file-input-bordered file-input w-full"
          multiple
          onchange={(e) => {
            selectedFiles = Array.from((e.target as HTMLInputElement).files || []);
          }}
        />
      </div>

      <!-- Display selected file names -->
      {#if selectedFiles.length > 0}
        <div class="mt-2">
          <span class="label-text">Ausgewählte Dateien:</span>
          <ul class="list-inside list-disc">
            {#each selectedFiles as file, index}
              <li class="flex items-center justify-between text-sm text-gray-700">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                <button
                  aria-label="remove file"
                  type="button"
                  class="btn btn-ghost btn-xs"
                  onclick={() => {
                    selectedFiles.splice(index, 1);
                    selectedFiles = selectedFiles; // Trigger reactivity
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    ><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg
                  >
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
      </div>

      <button type="submit" class="btn w-full btn-secondary" disabled={isLoading}>
        {#if isLoading}
          <span class="loading loading-spinner"></span>
          Sende...
        {:else}
          Catering erstellen
        {/if}
      </button>
    </form>
  {:else}
    <div class="prose text-center">
      <h2>Sie sind nicht angemeldet. Um diese Seite anzeigen zu können müssen Sie angenmeldet sein</h2>
      <button class="btn btn-secondary" onclick={() => login()}>Anmelden</button>
    </div>
  {/if}
</div>
<div class="spacer"></div>

<style lang="postcss">
  @reference '../../app.css';
  label {
    @apply my-2 font-semibold;
  }

  form {
    .inner-form {
      @apply transition-all duration-300;
      &.collapsed {
        @apply h-0 overflow-hidden;
      }
    }
  }

  :global(.carta-editor textarea) {
    min-height: 200px !important; /* eigene Wunschhöhe */
    max-height: 400px; /* optional */
    height: auto; /* sorgt für flexiblere Anpassung */
  }
  :global(.carta-editor) {
    min-height: 0 !important; /* Default aufheben */
    height: auto !important; /* dynamisch */
    max-height: 285px !important; /* dein Limit */
    @apply !rounded-lg !border-2 !border-base-content/20;
  }
  :global(.carta-toolbar) {
    @apply !border-b-2 !border-base-content/20;
  }
  :global(.carta-wrapper) {
    min-height: 0 !important; /* Default aufheben */
    height: auto !important; /* dynamisch */
    max-height: 250px !important; /* dein Limit */
  }
  :global(.carta-container) {
    min-height: 0 !important; /* Default aufheben */
    height: auto !important; /* dynamisch */
    max-height: 250px !important; /* dein Limit */
  }
  :global(.carta-input) {
    min-height: 0 !important; /* Default aufheben */
    height: auto !important; /* dynamisch */
    max-height: 250px !important; /* dein Limit */
  }
  :global(.carta-input-wrapper) {
    min-height: 0 !important; /* Default aufheben */
    height: auto !important; /* dynamisch */
    max-height: 250px !important; /* dein Limit */
  }
</style>
