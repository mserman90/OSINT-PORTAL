/**
 * Builds an Overpass API query string for searching features around a center point.
 * @param lat Latitude of the center point.
 * @param lon Longitude of the center point.
 * @param radius Search radius in meters.
 * @param features List of features to search for in "key=value" format.
 * @returns A formatted Overpass API query string.
 */
export const buildOSMQuery = (lat: number, lon: number, radius: number, features: string[]): string => {
  const around = `around:${radius},${lat},${lon}`;
  const lines = features
    .map(f => f.trim())
    .filter(Boolean)
    .map(f => {
      const [key, value] = f.split('=');
      if (!key || !value) return null;
      return `nwr["${key.trim()}"="${value.trim()}"](${around});`;
    })
    .filter(Boolean);

  if (lines.length === 0) return '';

  return `[out:json][timeout:25];\n(\n  ${lines.join('\n  ')}\n);\nout center;`;
};
