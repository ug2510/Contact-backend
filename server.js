import express from "express";
import contactRoutes from "./Routes/ContactRoutes.js";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://localhost:9000" }));

app.use(express.json());

app.use("/api/contacts", contactRoutes);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected error occurred.",
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
