<script lang="ts">
  import markdownit from 'markdown-it';
  import { userroles } from '$store/sharedStates.svelte';
  import { goto } from '$app/navigation';
  let { selectedCatering } = $props();
  let modal: HTMLDialogElement;

  export function openModal() {
    modal?.showModal();
  }
  export function closeModal() {
    modal?.close();
  }

  const md = markdownit();
  let formattedDate = $derived(selectedCatering?.date ? new Date(selectedCatering.date).toLocaleDateString('de-DE', { dateStyle: 'full' }) : 'N/A');
  let formattedStart = $derived(
    selectedCatering?.start ? new Date(selectedCatering.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'N/A'
  );
  let formattedEnd = $derived(
    selectedCatering?.end ? new Date(selectedCatering.end).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'N/A'
  );
  let formattedAdditionalServices = $derived(selectedCatering?.additionalServices?.length ? selectedCatering.additionalServices.join(', ') : 'Keine');

  // Check if user has creator role
  let isCreator = $derived(userroles.get().includes('creator'));

  function editCatering() {
    if (selectedCatering?.id) {
      goto(`/edit-catering?id=${selectedCatering.id}`);
      closeModal();
    }
  }
</script>

<dialog bind:this={modal} class="modal">
  <div class="modal-box h-full w-full max-w-3xl rounded-none md:h-auto md:rounded-2xl">
    <form method="dialog">
      <button class="btn absolute top-3 right-3 btn-circle btn-ghost btn-sm" onclick={closeModal}>✕</button>
    </form>

    {#if selectedCatering}
      <div class="flex max-w-none flex-col">
        <div class="flex justify-between">
          <div class="flex flex-col">
            <h2 class="text-2xl font-bold">{selectedCatering.title}</h2>
            {#if selectedCatering.date}
              <p class="text-accent">{formattedDate}</p>
            {/if}
          </div>
          {#if isCreator}
            <button class="btn mt-auto btn-sm" onclick={editCatering}> Bearbeiten </button>
          {/if}
        </div>

        <div class="divider"></div>

        <!-- Compact display for Startzeit, Endzeit, Personen -->
        <div class="mb-4 flex flex-wrap justify-between gap-3">
          {#if selectedCatering.start}
            <div class="badge badge-outline badge-lg">⏰ {formattedStart}</div>
          {/if}
          {#if selectedCatering.end}
            <div class="badge badge-outline badge-lg">🏁 {formattedEnd}</div>
          {/if}
          {#if selectedCatering.numberOfPersons}
            <div class="badge badge-outline badge-lg">🧑‍🤝‍🧑 {selectedCatering.numberOfPersons}</div>
          {/if}
          {#if selectedCatering.offeringCreated !== undefined}
            <div class="ml-auto badge badge-lg {selectedCatering.offeringCreated ? 'badge-success' : 'badge-error'} gap-2">
              Angebot erstellt: <strong>{selectedCatering.offeringCreated ? 'Ja' : 'Nein'}</strong>
            </div>
          {/if}
        </div>

        {#if selectedCatering.description}
          <div class="pr-8 leading-relaxed">
            {@html md.render(selectedCatering.description)}
          </div>
          <div class="divider mb-0"></div>
        {/if}
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <tbody>
              {#if selectedCatering.place}
                <tr>
                  <th>Ort:</th>
                  <td>{selectedCatering.place}</td>
                </tr>
              {/if}
              {#if selectedCatering.cateringType}
                <tr>
                  <th>Event-Typ:</th>
                  <td>{selectedCatering.cateringType}</td>
                </tr>
              {/if}
              {#if selectedCatering.cateringStyle}
                <tr>
                  <th>Catering-Stil:</th>
                  <td>{selectedCatering.cateringStyle}</td>
                </tr>
              {/if}
              {#if selectedCatering.additionalServices && selectedCatering.additionalServices.length > 0}
                <tr>
                  <th>Zusatzleistungen:</th>
                  <td>{formattedAdditionalServices}</td>
                </tr>
              {/if}
              {#if selectedCatering.client}
                <tr>
                  <th>Kunden Infos:</th>
                  <td class="markdownCell">{@html md.render(selectedCatering.client)}</td>
                </tr>
              {/if}
              {#if selectedCatering.remarks}
                <tr>
                  <th>Bemerkungen:</th>
                  <td class="markdownCell">{@html md.render(selectedCatering.remarks)}</td>
                </tr>
              {/if}
              {#if selectedCatering.specialWishes}
                <tr>
                  <th>Besondere Wünsche:</th>
                  <td>{selectedCatering.specialWishes}</td>
                </tr>
              {/if}
              {#if selectedCatering.flow}
                <tr>
                  <th>Ablauf (Flow):</th>
                  <td class="markdownCell">{@html md.render(selectedCatering.flow)}</td>
                </tr>
              {/if}
              {#if selectedCatering.relatedAssets && selectedCatering.relatedAssets.length > 0}
                <tr>
                  <th>Verknüpfte Assets:</th>
                  <td>
                    {#each selectedCatering.relatedAssets as asset}
                      <a href={asset.url} target="_blank" rel="noopener noreferrer" class="block link link-primary">{asset.fileName || asset.id}</a>
                    {/each}
                  </td>
                </tr>
              {/if}
            </tbody>
          </table>
        </div>

        <!-- Metadata section -->
        <div class="mt-2 flex justify-between text-sm text-accent">
          {#if selectedCatering.createdAt}
            <p><strong>Erstellt am:</strong> {new Date(selectedCatering.createdAt).toLocaleDateString('de-DE', { dateStyle: 'full' })}</p>
          {/if}
          <p>{selectedCatering.id}</p>
        </div>
      </div>
    {:else}
      <p class="text-center font-semibold text-error">Keine Details verfügba!</p>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button onclick={closeModal}>close</button>
  </form>
</dialog>

<style lang="postcss">
  @reference '../../app.css';
  .table :where(th, td) {
    vertical-align: top;
    min-width: 175px;
  }
</style>
