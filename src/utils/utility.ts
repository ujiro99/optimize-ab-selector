export function checkOptimizeOpen(url: string): boolean {
  if (!url) return false;
  return url.match(/optimize.google.com/) != null;
}
