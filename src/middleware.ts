import { defineMiddleware } from "astro:middleware";

// Rutas que no requieren autenticación
const publicRoutes = ["/login", "/"];

export const onRequest = defineMiddleware(async (context, next) => {
  const isPublicRoute = publicRoutes.some(p => context.url.pathname.startsWith(p));

  // Si es una ruta pública o de la API, deja pasar
  if (isPublicRoute || context.url.pathname.startsWith('/api')) {
    return next();
  }

  const sessionCookie = context.cookies.get('session');

  // Si no hay cookie de sesión, redirige al login
  if (!sessionCookie) {
    return context.redirect("/login");
  }

  // Si hay cookie, permite el acceso
  return next();
});