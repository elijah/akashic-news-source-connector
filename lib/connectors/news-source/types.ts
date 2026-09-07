export interface CivicEntity {
  id: string;
  source: string;
  timestamp: string;
  reliability: number;
  title: string;
  date: string;
  content: string;
  outcomes: any[];
  voteResult: string;
  type: string;
  engagementScore: number;
  numComments: number;
}