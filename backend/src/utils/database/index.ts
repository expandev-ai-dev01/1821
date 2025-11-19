/**
 * @summary
 * Database utility functions.
 * Provides connection pooling and query execution utilities.
 *
 * @module utils/database
 */

import sql from 'mssql';
import { config } from '@/config';

const projectSchema = `project_${process.env.PROJECT_ID}`;

const poolConfig: sql.config = {
  server: config.database.server,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  options: {
    encrypt: config.database.options.encrypt,
    trustServerCertificate: config.database.options.trustServerCertificate,
    enableArithAbort: true,
    defaultSchema: projectSchema,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(poolConfig);
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}
