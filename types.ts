
export interface Blessing {
  text: string;
  theme: 'prosperity' | 'wisdom' | 'serenity';
  author: string;
}

export enum TreeState {
  IDLE = 'IDLE',
  TREE_SHAPE = 'TREE_SHAPE',
  EXPLODING = 'EXPLODING',
  SCATTERED = 'SCATTERED',
  REASSEMBLING = 'REASSEMBLING',
  WISHING = 'WISHING',
  CELEBRATING = 'CELEBRATING'
}

export type ChristmasSong = 'all-i-want' | 'santa-tell-me' | null;
