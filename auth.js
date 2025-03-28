import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql from "mssql"; 
import { getDbPool } from "./dbPool.js";
import { executeQuery } from "./queryExecutor.js";

export async function InsertNewUser(name, email, phnumber, address, password) {
  try {
    console.log("InsertNewUser called with:", { name, email, phnumber, address });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("Hashed password generated.");
    const pool = await getDbPool();
    console.log("Database pool retrieved.");

    // Define query and inputs
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
    console.log("Prepared query and inputs:", { query, inputs });

    // Execute query
    const result = await executeQuery(pool, query, inputs);
    console.log("Query execution result:", result);

    return result;
  } catch (err) {
    console.error("Error in InsertNewUser:", err);
    throw err;
  }
}

export async function loginUser(email, password) {
  try {
    console.log("loginUser called with email:", email);

    // Get database connection pool
    const pool = await getDbPool();
    console.log("Database pool retrieved.");

    // Define query and inputs
    const query = "SELECT * FROM AuthTable WHERE email = ?";
    const inputs = [{ type: sql.VarChar, value: email }];
    console.log("Prepared query and inputs:", { query, inputs });

    // Execute query
    const result = await executeQuery(pool, query, inputs);
    console.log("Query execution result:", result);

    // Check if user exists
    if (result.recordset.length === 0) {
      console.error("User not found for email:", email);
      throw new Error("User not found");
    }

    const user = result.recordset[0];
    console.log("User retrieved from database:", user);

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isMatch);

    if (!isMatch) {
      console.error("Invalid credentials for email:", email);
      throw new Error("Invalid credentials");
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log("JWT generated for user:", { id: user.id, name: user.name, email: user.email });

    return token;
  } catch (err) {
    console.error("Error in loginUser:", err);
    throw err;
  }
}
