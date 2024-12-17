import sql from "mssql";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    console.log(`Connected to the database successfully as ${globalUsername}.`);

    if (!globalUsername) {
      throw new Error("No username is set in globalUsername.");
    }

    const result = await pool
      .request()
      .input("owner", sql.VarChar, globalUsername)
      .query("SELECT * FROM ContactList WHERE Activity = 0 AND owner = @owner");

    return result.recordset;
  } catch (err) {
    console.error("Database query failed:", err);
    throw err;
  }
}

export async function getAllContacts() {
  try {
    const pool = await getDbPool();
    console.log(`Connected to the database successfully as ${globalUsername}.`);

    if (!globalUsername) {
      throw new Error("No username is set in globalUsername.");
    }

    const result = await pool
      .request()
      .input("owner", sql.VarChar, globalUsername)
      .query("SELECT * FROM ContactList WHERE Activity = 1 AND owner = @owner");

    return result.recordset;
  } catch (err) {
    console.error("Database query failed:", err);
    throw err;
  }
}

export async function updateContactByPhone(phone, name, email) {
  try {
    if (!phone || !name || !email) {
      throw new Error("All parameters (phone, name, email) are required.");
    }

    const pool = await getDbPool();
    console.log(`Connected to the database successfully as ${globalUsername}.`);
    console.log("Input Parameters:", { phone, name, email });

    const result = await pool
      .request()
      .input("phone", sql.VarChar, phone)
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email).query(`
        UPDATE ContactList
        SET name = @name, email = @email
        WHERE phnumber = @phone
      `);

    return result;
  } catch (err) {
    console.error("Database update failed:", err);
    throw err;
  }
}

export async function getContactByPhone(name) {
  try {
    const pool = await getDbPool();
    console.log(`Connected to the database successfully as ${globalUsername}.`);

    const result = await pool
      .request()
      .input("name", sql.VarChar, `%${name}%`)
      .query("SELECT * FROM ContactList WHERE name LIKE @name");
    return result.recordset;
  } catch (err) {
    console.error("Database query failed:", err);
  }
}

export async function getContactByPhoneNo(phnumber) {
  try {
    const pool = await getDbPool();
    console.log(`Connected to the database successfully as ${globalUsername}.`);

    const result = await pool
      .request()
      .input("phnumber", sql.VarChar, phnumber)
      .query("SELECT * FROM ContactList WHERE phnumber = @phnumber");
    return result.recordset;
  } catch (err) {
    console.error("Database query failed:", err);
  }
}

export async function InsertNew(name, email, phnumber) {
  try {
    const pool = await getDbPool();
    const Activity = 1;
    console.log("Activity value set to:", Activity);

    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("phnumber", sql.VarChar, phnumber)
      .input("owner", sql.VarChar, globalUsername)
      .input("Activity", sql.Int, Activity) 
      .query(
        `INSERT INTO ContactList (name, email, phnumber, owner, Activity) 
         VALUES (@name, @email, @phnumber, @owner, @Activity)`
      );

    console.log("Insert successful! Result:", result);
    return result;
  } catch (err) {
    console.error("Database insert failed:", err.message);

    console.error("Debugging Info: Pool or Query might have issues.");

    throw err; 
  }
}

export async function InsertNewUser(name, email, phnumber, address, password) {
  try {
    const salt = await bcrypt.genSalt(10); // Generate salt for hashing
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    const pool = await getDbPool();
    console.log(`Connected to the database successfully as ${globalUsername}.`);

    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("phnumber", sql.VarChar, phnumber)
      .input("address", sql.VarChar, address)
      .input("password", sql.VarChar, hashedPassword)
      .query(
        "INSERT INTO AuthTable (name, email, phnumber, address, password) VALUES (@name, @email, @phnumber, @address, @password)"
      );
    return result;
  } catch (err) {
    console.error("Database insert failed:", err);
  }
}

export async function loginUser(email, password) {
  try {
    const pool = await getDbPool();
    console.log("Connected to the database successfully.");

    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM AuthTable WHERE email = @email");

    if (result.recordset.length === 0) {
      throw new Error("User not found");
    }

    const user = result.recordset[0];
    const username = user.name;
    //const email = user.email;
    const phnumber = user.phnumber;
    const address = user.address;

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }
    globalUsername = username;
    globalAddress = address;
    globalPhnumber = phnumber;
    //globalEmail = email;

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token, username };
  } catch (err) {
    console.error("Login failed:", err);
    throw err;
  }
}

export async function DeactivateContactById(phnumber) {
  try {
    const pool = await getDbPool();
    console.log(`Connected to the database successfully as ${globalUsername}.`);

    const result = await pool
      .request()
      .input("phnumber", sql.VarChar, phnumber)
      .query("UPDATE ContactList SET Activity = 0 WHERE phnumber = @phnumber");

    return result;
  } catch (err) {
    console.error("Database update failed:", err);
  }
}
export { globalUsername, globalPhnumber, globalAddress };
