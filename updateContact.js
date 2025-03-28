import { getDbPool } from "./dbPool.js";
import { executeQuery } from "./queryExecutor.js";

export async function updateContactByPhone(phone, name, email) {
  try {
    const pool = await getDbPool();

    const query = `
      UPDATE ContactList
      SET name = ?, email = ?
      WHERE phnumber = ?
    `;
    const inputs = [
      { type: sql.VarChar, value: name },
      { type: sql.VarChar, value: email },
      { type: sql.VarChar, value: phone },
    ];

    return await executeQuery(pool, query, inputs);
  } catch (err) {
    console.error("Error in updateContactByPhone:", err);
    throw err;
  }
}
