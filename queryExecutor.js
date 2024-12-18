import sql from "mssql";

export async function executeQuery(pool, query, inputs = []) {
  try {
    const request = pool.request();

    inputs.forEach((input, index) => {
      const paramName = `param${index}`;
      query = query.replace("?", `@${paramName}`);
      request.input(paramName, input.type, input.value);
    });

    const result = await request.query(query);
    console.log("Query executed successfully:", { query, inputs });
    return result;
  } catch (err) {
    console.error("Query execution failed:", { query, inputs, error: err });
    throw err;
  }
}
