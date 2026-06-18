export interface Server {
  hostname: string;
  port: number;
  ip?: string;
  dns?: string;
}

export type ServersPool = Server[];
