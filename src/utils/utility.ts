export function checkOptimizeOpen(url: string): boolean {
  return url.match(/optimize.google.com/) != null;
}
