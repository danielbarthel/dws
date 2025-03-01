export interface Collection {
  name: string;
  visible: boolean;
  documents: any[];
  columns: Column[];
}

export interface Column {
  name: string;
  visible: boolean;
  type: 'string' | 'number' | 'boolean' | 'timestamp' | 'array' | 'map';
}
