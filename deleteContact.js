import { getDbPool } from "./dbPool.js";
import { executeQuery } from "./queryExecutor.js";
import { globalUsername } from "./globals.js";

export async function DeactivateContactById(phnumber) {
  try {
    const pool = await getDbPool();

    const query = "UPDATE ContactList SET Activity = 0 WHERE phnumber = ?";
    const inputs = [{ type: sql.VarChar, value: phnumber }];

    return await executeQuery(pool, query, inputs);
  } catch (err) {
    console.error("Error in DeactivateContactById:", err);
    throw err;
  }
}

export async function getAllDeletedContacts() {
  try {
    const pool = await getDbPool();

    const query = "SELECT * FROM ContactList WHERE Activity = 0 AND owner = ?";
    const inputs = [{ type: sql.VarChar, value: globalUsername }];

    const result = await executeQuery(pool, query, inputs);
    return result.recordset;
  } catch (err) {
    console.error("Error in getAllDeletedContacts:", err);
    throw err;
  }
}
