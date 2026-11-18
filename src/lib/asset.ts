/** Prefixes a site-absolute public path ("/media/x.jpg") with the deploy base (e.g. "/ground-zero/"). */
export function asset(path: string): string {
  return path.startsWith("/") ? import.meta.env.BASE_URL + path.slice(1) : path;
}
