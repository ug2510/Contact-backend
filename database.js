import sql from "mssql";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { executeQuery } from "./queryExecutor.js";

dotenv.config();

const config = {
  server: process.env.MY_SERVER,
  port: parseInt(process.env.MY_PORT, 10),
  database: process.env.MY_DATABASE,
  user: process.env.MY_USER,
  password: process.env.MY_PASSWORD,
  options: {
    trustServerCertificate: true,
  },
};

let poolPromise;
let globalUsername = null;
let globalAddress = null;
let globalEmail = null;
let globalPhnumber = null;

async function getDbPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
  }
  return poolPromise;
}


export async function getAllDeletedContacts() {
  try {
    const pool = await getDbPool();
    if (!globalUsername) {
      throw new Error("No username is set in globalUsername.");
    }

    const query = "SELECT * FROM ContactList WHERE Activity = 0 AND owner = ?";
    const inputs = [{ type: sql.VarChar, value: globalUsername }];

    const result = await executeQuery(pool, query, inputs);
    return result.recordset;
  } catch (err) {
    console.error("Error in getAllDeletedContacts:", err);
    throw err;
  }
}

export async function getAllContacts() {
  try {
    const pool = await getDbPool();
    if (!globalUsername) {
      throw new Error("No username is set in globalUsername.");
    }

    const query = "SELECT * FROM ContactList WHERE Activity = 1 AND owner = ?";
    const inputs = [{ type: sql.VarChar, value: globalUsername }];

    const result = await executeQuery(pool, query, inputs);
    return result.recordset;
  } catch (err) {
    console.error("Error in getAllContacts:", err);
    throw err;
  }
}

export async function updateContactByPhone(phone, name, email) {
  try {
    if (!phone || !name || !email) {
      throw new Error("All parameters (phone, name, email) are required.");
    }

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

    const result = await executeQuery(pool, query, inputs);
    return result;
  } catch (err) {
    console.error("Error in updateContactByPhone:", err);
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
    console.error("Error in getContactByName:", err);
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

    const result = await executeQuery(pool, query, inputs);
    return result;
  } catch (err) {
    console.error("Error in InsertNew:", err);
    throw err;
  }
}

export async function InsertNewUser(name, email, phnumber, address, password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const pool = await getDbPool();

    const query = `
      INSERT INTO AuthTable (name, email, phnumber, address, password)
      VALUES (?, ?, ?, ?, ?)
    `;
    const inputs = [
      { type: sql.VarChar, value: name },
      { type: sql.VarChar, value: email },
      { type: sql.VarChar, value: phnumber },
      { type: sql.VarChar, value: address },
      { type: sql.VarChar, value: hashedPassword },
    ];

    const result = await executeQuery(pool, query, inputs);
    return result;
  } catch (err) {
    console.error("Error in InsertNewUser:", err);
    throw err;
  }
}


export async function loginUser(email, password) {
  try {
    const pool = await getDbPool();

    const query = "SELECT * FROM AuthTable WHERE email = ?";
    const inputs = [{ type: sql.VarChar, value: email }];

    const result = await executeQuery(pool, query, inputs);

    if (result.recordset.length === 0) {
      throw new Error("User not found");
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    globalUsername = user.name;
    globalAddress = user.address;
    globalPhnumber = user.phnumber;

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token, username: user.name };
  } catch (err) {
    console.error("Error in loginUser:", err);
    throw err;
  }
}

export async function DeactivateContactById(phnumber) {
  try {
    const pool = await getDbPool();

    const query = "UPDATE ContactList SET Activity = 0 WHERE phnumber = ?";
    const inputs = [{ type: sql.VarChar, value: phnumber }];

    const result = await executeQuery(pool, query, inputs);
    return result;
  } catch (err) {
    console.error("Error in DeactivateContactById:", err);
    throw err;
  }
}

export { globalUsername, globalPhnumber, globalAddress };
