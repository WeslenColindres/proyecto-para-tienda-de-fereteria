export function normalizeRoute(route: string): string {
  if (!route) return '/dashboard';
  let normalized = route.trim();
  if (normalized.startsWith('#')) normalized = normalized.slice(1);
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  normalized = normalized.replace(/\/+/g, '/');
  return normalized;
}
