import sql from "mssql";
import dotenv from "dotenv";

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

export async function getDbPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(config);
    console.log("Database connection is successful")
  }
  return poolPromise;
}
