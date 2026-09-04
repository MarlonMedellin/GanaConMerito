declare module "pg" {
  export class Client {
    constructor(config?: any);
    connect(): Promise<void>;
    end(): Promise<void>;
    query(queryText: string | { text: string; values?: any[] }, values?: any[]): Promise<{ rows: any[] }>;
  }
}

