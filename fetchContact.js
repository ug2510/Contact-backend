import { getDbPool } from "./dbPool.js";
import { executeQuery } from "./queryExecutor.js";
import { globalUsername } from "./globals.js";

export async function getAllContacts() {
  try {
    const pool = await getDbPool();

    const query = "SELECT * FROM ContactList WHERE Activity = 1 AND owner = ?";
    const inputs = [{ type: sql.VarChar, value: globalUsername }];

    const result = await executeQuery(pool, query, inputs);
    return result.recordset;
  } catch (err) {
    console.error("Error in getAllContacts:", err);
    throw err;
  }
}

export async function getContactByPhone(name) {
  try {
    const pool = await getDbPool();

    const query = "SELECT * FROM ContactList WHERE name LIKE ?";
    const inputs = [{ type: sql.VarChar, value: `%${name}%` }];

    const result = await executeQuery(pool, query, inputs);
    return result.recordset;
  } catch (err) {
    console.error("Error in getContactByPhone:", err);
    throw err;
  }
}

export async function getContactByPhoneNo(phnumber) {
  try {
    const pool = await getDbPool();

    const query = "SELECT * FROM ContactList WHERE phnumber = ?";
    const inputs = [{ type: sql.VarChar, value: phnumber }];

    const result = await executeQuery(pool, query, inputs);
    return result.recordset;
  } catch (err) {
    console.error("Error in getContactByPhoneNo:", err);
    throw err;
  }
}
