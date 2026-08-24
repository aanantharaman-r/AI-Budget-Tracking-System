const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// MongoDB
// ===============================
const client = new MongoClient(process.env.MONGODB_URI);

let db;
let budgetsCollection;

// Connect MongoDB
async function connectDB() {
  try {
    await client.connect();

    db = client.db("budgetTracker");
    budgetsCollection = db.collection("budgets");

    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
}

// ===============================
// Test Route
// ===============================
app.get("/", (req, res) => {
  res.send("AI Budget Tracker Backend is Running!");
});

// ===============================
// GET - Get All Budgets
// ===============================
app.get("/api/budget", async (req, res) => {
  try {
    const budgets = await budgetsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);

    res.status(500).json({
      message: "Failed to fetch budgets",
    });
  }
});

// ===============================
// POST - Save Budget
// ===============================
app.post("/api/budget", async (req, res) => {
  try {
    const { salary, monthlyBudget } = req.body;

    // Check required fields
    if (salary === undefined || monthlyBudget === undefined) {
      return res.status(400).json({
        message: "Salary and monthly budget are required",
      });
    }

    const budgetData = {
      salary: Number(salary),
      monthlyBudget: Number(monthlyBudget),
      createdAt: new Date(),
    };

    // Save to MongoDB
    const result = await budgetsCollection.insertOne(budgetData);

    console.log("Budget Saved Successfully!");
    console.log(budgetData);

    res.status(201).json({
      message: "Budget saved successfully!",
      data: {
        _id: result.insertedId,
        ...budgetData,
      },
    });
  } catch (error) {
    console.error("Error saving budget:", error);

    res.status(500).json({
      message: "Failed to save budget",
    });
  }
});

// ===============================
// Start Server After MongoDB Connects
// ===============================
const PORT = 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();