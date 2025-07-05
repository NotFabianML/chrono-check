import type { APIRoute } from 'astro';

export const prerender = false;

const USERNAME = import.meta.env.AUTH_USER;
const PASSWORD = import.meta.env.AUTH_PASS;

export const POST: APIRoute = async ({ request, cookies }) => {
  let data;
  try {
    data = await request.json();
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'La petición no contenía datos válidos.' }),
      { status: 400 }
    );
  }

  const { username, password } = data;

  if (username === USERNAME && password === PASSWORD) {
    cookies.set('session', 'secret-auth-token', {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      maxAge: 60 * 60 * 8,
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response(
    JSON.stringify({ message: 'Credenciales incorrectas' }),
    { status: 401 }
  );
};