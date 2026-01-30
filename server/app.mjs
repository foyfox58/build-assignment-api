import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

// middleware
app.use(express.json());

// test route
app.get("/test", (req, res) => {
  res.json({ message: "Server API is working 🚀" });
});

// Create Assignment
app.post("/assignments", async (req, res) => {
  try {
    const { title, content, category } = req.body;

    // ✅ ตรวจสอบข้อมูลจาก client
    if (!title || !content || !category) {
      return res.status(400).json({
        message:
          "Server could not create assignment because there are missing data from client",
      });
    }

    const newAssignments = {
      title,
      content,
      category,
      created_at: new Date(),
      updated_at: new Date(),
      published_at: new Date(),
    };

    await connectionPool.query(
      `INSERT INTO assignments (title, content, category)
       VALUES ($1, $2, $3)`,
      [title, content, category]
    );

    return res.status(201).json({
      message: "Created assignment successfully",
    });

  } catch (error) {
    console.log(error);

    // ❌ ปัญหา database / server
    return res.status(500).json({
      message:
        "Server could not create assignment because database connection",
    });
  }
});

// start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
