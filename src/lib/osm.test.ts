import { describe, it, expect } from 'vitest';
import { buildOSMQuery } from './osm';

describe('buildOSMQuery', () => {
  it('should build a valid Overpass query for a single feature', () => {
    const lat = 41.0082;
    const lon = 28.9784;
    const radius = 1000;
    const features = ['amenity=school'];
    
    const query = buildOSMQuery(lat, lon, radius, features);
    
    expect(query).toContain('[out:json][timeout:25];');
    expect(query).toContain('nwr["amenity"="school"](around:1000,41.0082,28.9784);');
    expect(query).toContain('out center;');
  });

  it('should build a valid Overpass query for multiple features', () => {
    const lat = 41.0082;
    const lon = 28.9784;
    const radius = 500;
    const features = ['amenity=school', 'amenity=hospital'];
    
    const query = buildOSMQuery(lat, lon, radius, features);
    
    expect(query).toContain('nwr["amenity"="school"](around:500,41.0082,28.9784);');
    expect(query).toContain('nwr["amenity"="hospital"](around:500,41.0082,28.9784);');
  });

  it('should return an empty string if no valid features are provided', () => {
    const query = buildOSMQuery(41, 28, 1000, ['invalid_feature']);
    expect(query).toBe('');
  });

  it('should handle whitespace in feature strings', () => {
    const query = buildOSMQuery(41, 28, 1000, [' amenity = school ']);
    expect(query).toContain('nwr["amenity"="school"](around:1000,41,28);');
  });
});
