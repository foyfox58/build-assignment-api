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

app.get("/assignments", async (req, res) => {
  try {
    const result = await connectionPool.query(
      "SELECT * FROM assignments"
    );

    return res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.post("/assignments", async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const result = await connectionPool.query(
      "INSERT INTO assignments (title, content, category) VALUES ($1, $2, $3) RETURNING *",
      [title, content, category]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not create assignment",
      });
    }
    return res.status(201).json({
      message: "Created assignment successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentId", async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const result = await connectionPool.query(
      "SELECT * FROM assignments WHERE assignment_id = $1",
      [assignmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment",
      });
    }

    return res.status(200).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});


app.put("/assignments/:assignmentId", async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { title, content, category } = req.body;

    const result = await connectionPool.query(
      `UPDATE assignments
       SET title = $1,
           content = $2,
           category = $3,
           updated_at = $4
       WHERE assignment_id = $5`,
      [title, content, category, new Date(), assignmentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }

    return res.status(200).json({
      message: "Updated assignment successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});


app.delete("/assignments/:assignmentId", async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const result = await connectionPool.query(
      "DELETE FROM assignments WHERE assignment_id = $1",
      [assignmentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }

    return res.status(200).json({
      message: "Deleted assignment successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
});




// start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
