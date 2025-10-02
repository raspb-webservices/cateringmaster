<script lang="ts">
  import { goto } from '$app/navigation';
  import Loader from '$lib/components/loader.svelte';
  import FullCalendar from 'svelte-fullcalendar';
  import type CalendarOptions from 'svelte-fullcalendar';
  import deLocale from '@fullcalendar/core/locales/de';
  import daygridPlugin from '@fullcalendar/daygrid';
  import EventDetailsModal from '$lib/components/event-details-modal.svelte';
  import type { Catering } from '$interfaces/catering.interface';

  const { data } = $props();

  let events = $state(data.events);
  let eventModal: EventDetailsModal; 
  let selectedCatering: Catering | null = $state(null);
  let currentEvents: any[] = [];

  for (let i = 0; i < events?.length; i++) {
    const currentCatering = events[i];
    let tempEvent: any = {
      title: currentCatering.title,
      start: currentCatering.start ? new Date(currentCatering.start) : currentCatering.date ? new Date(currentCatering.date) : undefined,
      end: currentCatering.end ? new Date(currentCatering.end) : currentCatering.date ? new Date(currentCatering.date) : undefined,
      allDay: !currentCatering.start && !currentCatering.end,
      extendedProps: currentCatering 
    };
    currentEvents.push(tempEvent);
  }

  let options: CalendarOptions = {
    events: currentEvents,
    initialView: 'dayGridMonth',
    weekends: true,
    locales: [deLocale],
    locale: 'de',
    plugins: [daygridPlugin],
    headerToolbar: {
      left: 'prev,next,today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    eventClick: function (info: any) {
      console.log("info ", info)
      selectedCatering = info.event.extendedProps as Catering;
      eventModal.openModal();
    }
  };
</script>

<svelte:head>
  <title>Startseite</title>
  <meta name="description" content="Alle geplanten Catering-Events auf einen Blick." />
</svelte:head>

<div class="inner-box">
  <div class="spacer"></div>
  <div class="p-4">
    <FullCalendar {options} />
  </div>
  
  <div class="spacer"></div>
</div>

<EventDetailsModal bind:this={eventModal} {selectedCatering} />

<style lang="postcss">
  @reference '../app.css';
</style>
