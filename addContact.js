import { getDbPool } from "./dbPool.js";
import { executeQuery } from "./queryExecutor.js";
import { globalUsername } from "./globals.js";

export async function InsertNew(name, email, phnumber) {
  try {
    const pool = await getDbPool();

    const query = `
      INSERT INTO ContactList (name, email, phnumber, owner, Activity)
      VALUES (?, ?, ?, ?, ?)
    `;
    const inputs = [
      { type: sql.VarChar, value: name },
      { type: sql.VarChar, value: email },
      { type: sql.VarChar, value: phnumber },
      { type: sql.VarChar, value: globalUsername },
      { type: sql.Int, value: 1 },
    ];

    return await executeQuery(pool, query, inputs);
  } catch (err) {
    console.error("Error in InsertNew:", err);
    throw err;
  }
}
