declare module "pg" {
  export interface QueryResult<Row = any> {
    rows: Row[];
    rowCount: number | null;
  }

  export class Client {
    constructor(config?: { connectionString?: string });
    connect(): Promise<void>;
    end(): Promise<void>;
    query<Row = any>(queryText: string | { text: string; values?: unknown[] }, values?: unknown[]): Promise<QueryResult<Row>>;
  }
}
