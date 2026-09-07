import { CivicEntity } from './types';

export function mapNewsToSchema(article: any): CivicEntity {
  return {
    id: article.id || `news-${Date.now()}`,
    source: 'news-source',
    timestamp: article.publishedAt || new Date().toISOString(),
    reliability: article.reliability || 'medium',
    title: article.title || 'News Article',
    date: article.date || article.publishedAt?.split('T')[0] || '',
    content: article.content || '',
    outcomes: [],
    voteResult: 'not_present',
    type: 'news',
    engagementScore: article.engagementScore || 0,
    numComments: article.numComments || 0
  };
}