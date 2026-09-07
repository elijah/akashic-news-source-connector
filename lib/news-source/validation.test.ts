import { mapNewsToSchema } from './mapper';
import { mockNewsArticle } from './mock-data';

describe('News Source Connector Validation', () => {
  test('maps news articles to CivicEntity objects', () => {
    const entity = mapNewsToSchema(mockNewsArticle);
    expect(entity.id).toBe(mockNewsArticle.id);
    expect(entity.source).toBe('news-source');
    expect(entity.title).toContain('Breaking');
    expect(entity.content).toContain('community garden');
    expect(entity.type).toBe('news');
  });

  test('handles incomplete news articles', () => {
    const incomplete = { id: 'news1', source: 'news-source', headers: [] };
    const entity = mapNewsToSchema(incomplete);
    expect(entity.title).toBe('News Article'); // Default title
  });

  test('preserves publication metadata', () => {
    const entity = mapNewsToSchema(mockNewsArticle);
    expect(entity.title).toBe(mockNewsArticle.title);
    expect(entity.content).toBe(mockNewsArticle.content);
  });
});