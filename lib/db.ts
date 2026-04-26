// =====================================================
// POSTGRESQL DATABASE CONNECTION
// =====================================================
// npm install pg @types/pg

import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

/**
 * Parser seguro para DATABASE_URL com senhas contendo '@'.
 * new URL() falha quando a senha tem '@' (ex: "demonio3264@@@").
 * Solução: pegar tudo antes do ÚLTIMO '@' como credenciais.
 *
 * Exemplo problemático:
 *   postgresql://postgres:demonio3264@@@db.supabase.co:5432/postgres
 *   → user=postgres, password=demonio3264@@, host=db.supabase.co
 */
function parseDbUrl(raw: string) {
  const withoutScheme = raw.replace(/^postgres(?:ql)?:\/\//, "");
  const lastAt = withoutScheme.lastIndexOf("@");
  if (lastAt === -1) throw new Error("DATABASE_URL inválida: sem '@'");

  const credentials = withoutScheme.slice(0, lastAt);
  const hostPart    = withoutScheme.slice(lastAt + 1);

  const colonIdx = credentials.indexOf(":");
  const user     = credentials.slice(0, colonIdx);
  const password = credentials.slice(colonIdx + 1); // senha crua, pode ter '@'

  const [hostPort, ...dbParts] = hostPart.split("/");
  const database = dbParts.join("/").split("?")[0];
  const [host, portStr] = hostPort.split(":");
  const port = portStr ? parseInt(portStr, 10) : 5432;

  return { user, password, host, port, database };
}

function createPool() {
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    console.warn("[DB] DATABASE_URL não definida — modo mock ativo.");
    return new Pool({ connectionString: "postgresql://x:x@localhost:5432/x" });
  }

  try {
    const { user, password, host, port, database } = parseDbUrl(raw);
    console.log(`[DB] Conectando: ${user}@${host}:${port}/${database}`);
    return new Pool({
      user,
      password, // string pura sem encode/decode
      host,
      port,
      database,
      ssl: { rejectUnauthorized: false }, // obrigatório para Supabase
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  } catch (err) {
    console.error("[DB] Erro ao parsear DATABASE_URL:", err);
    return new Pool({ connectionString: "postgresql://x:x@localhost:5432/x" });
  }
}

// Singleton para evitar múltiplas pools em dev (hot reload)
export const pool = globalThis._pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalThis._pgPool = pool;

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export async function queryOne<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export async function transaction<T>(
  fn: (client: import("pg").PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
