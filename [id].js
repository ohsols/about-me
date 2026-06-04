export async function onRequest({ params }) {
  const res = await fetch(`https://api.lanyard.rest/v1/users/${params.id}`);
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
