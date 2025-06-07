export interface SqlContentProps {
  sql: string;
}

export interface SqlToken {
  type: 'keyword' | 'comment' | 'string' | 'text';
  content: string;
  key: string;
} 