export const load = async ({ fetch }) => {
  const data = await fetch('/api/events')
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  return { events: data };
};
