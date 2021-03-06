import { EventEmitter } from "events"
import { Writable, Readable } from "stream"
import { Pool } from "generic-pool"
import { TlsOptions } from "tls"

interface QueryCallback {
  (err: Error, result: ResultSet): void;
}

interface ClientConnectCallback {
  (err: Error, client: Client): void;
}

interface ConnectCallback {
  (err: Error, client: Client, done: Done): void;
}

interface Done {
  (): void;
}

interface ResultSet {
  rows: any[];
}

interface QueryConfig {
  name?: string;
  text: string;
  values?: any[];
}

interface Config {
  host?: string;
  user?: string;
  database?: string;
  password?: string;
  port?: number;
  poolSize?: number;
  rows?: number;
  binary?: boolean;
  poolIdleTimeout?: number;
  reapIntervalMillis?: number;
  poolLog?: boolean;
  client_encoding?: string;
  ssl?: TlsOptions;
  application_name?: string;
  fallback_application_name?: string;
  parseInputDatesAsUTC?: boolean;
}

interface ResultBuilder {
  command: string;
  rowCount: number;
  oid: number;
  rows: any[];
  addRow(row: any): void;
}

export interface PoolSet {
  all: { [key: string]: ClientPool },
  getOrCreate(config: Config): ClientPool,
  getOrCreate(connString: string): ClientPool
}

export interface ClientPool extends Pool<Client> {
  name: string;
  max: number;
  idleTimeoutMillis: number;
  reapIntervalMillis: number;
  log: boolean;
  create(cb: ClientConnectCallback): void;
  destroy(client: Client): void;
}

export class Query extends EventEmitter {
  text: string;
  values: any[];

  on(event: "row", listener: (row: any, result: ResultBuilder) => void): this;
  on(event: "end", listener: (result: ResultBuilder) => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: string, listener: Function): this;
}

export class Client extends EventEmitter {
  constructor(connString: string);
  constructor(config: Config);

  user: string;
  database: string;
  port: string;
  host: string;
  password: string;
  binary: boolean;
  encoding: string;
  ssl: boolean;

  query(query: QueryConfig, callback?: QueryCallback): Query;
  query(text: string, callback: QueryCallback): Query;
  query(text: string, values: any[], callback: QueryCallback): Query;

  connect(callback: ClientConnectCallback): void;
  end(): void;

  pauseDrain(): void;
  resumeDrain(): void;

  on(event: "drain", listener: () => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: "notification", listener: (message: any) => void): this;
  on(event: "notice", listener: (message: any) => void): this;
  on(event: string, listener: Function): this;
}

export var defaults: Config;
export var pools: PoolSet;
export function connect(connString: string, callback: ConnectCallback): void;
export function end(): void;
export function cancel(config: Config, client: Client, query: Query): void;
