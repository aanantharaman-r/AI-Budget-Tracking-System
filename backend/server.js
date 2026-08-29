const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ========================================
// MongoDB
// ========================================

const client = new MongoClient(process.env.MONGODB_URI);

let db;
let budgetsCollection;
let transactionsCollection;
let usersCollection;

// ========================================
// Gemini AI
// ========================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ========================================
// Connect MongoDB
// ========================================

async function connectDB() {
  try {
    await client.connect();

    db = client.db("budgetTracker");

    budgetsCollection = db.collection("budgets");
    transactionsCollection = db.collection("transactions");
    usersCollection = db.collection("users");

    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
}

// ========================================
// Home
// ========================================

app.get("/", (req, res) => {
  res.send("AI Budget Tracker Backend is Running!");
});

// ========================================
// Auth Routes (MongoDB User Storage)
// ========================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, salary } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await usersCollection.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const newUser = {
      name: name.trim(),
      email: cleanEmail,
      password: password, // Stored in MongoDB as requested
      monthlySalary: Number(salary) || 0,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    const userProfile = {
      id: result.insertedId,
      name: newUser.name,
      email: newUser.email,
      monthlySalary: newUser.monthlySalary,
    };

    console.log("User Registered in MongoDB:", userProfile.email);
    res.status(201).json({ message: "User registered successfully", user: userProfile });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await usersCollection.findOne({ email: cleanEmail });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      monthlySalary: user.monthlySalary || 0,
    };

    console.log("User Logged In from MongoDB:", userProfile.email);
    res.status(200).json({ message: "Login successful", user: userProfile });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ========================================
// GET - Budget Data for specific user
// ========================================

app.get("/api/budget", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || req.query.userId || "default";

    const budgets = await budgetsCollection
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    res.status(200).json(budgets);
  } catch (error) {
    console.error("Error fetching budget data:", error);

    res.status(500).json({
      message: "Failed to fetch budget data",
    });
  }
});

// ========================================
// POST - Save / Update Salary for user
// ========================================

app.post("/api/budget/salary", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || req.body.userId || "default";
    const salary = Number(req.body.salary) || 0;

    const salaryData = {
      userId,
      type: "salary",
      salary,
      monthlyBudget: 0,
      updatedAt: new Date(),
    };

    const result = await budgetsCollection.updateOne(
      { userId, type: "salary" },
      {
        $set: salaryData,
      },
      {
        upsert: true,
      }
    );

    console.log(`Salary Saved/Updated for User [${userId}]:`, salaryData);

    res.status(200).json({
      message: "Salary saved successfully!",
      data: {
        salary,
        id: result.upsertedId,
      },
    });
  } catch (error) {
    console.error("Error saving salary:", error);

    res.status(500).json({
      message: "Failed to save salary",
    });
  }
});

// ========================================
// POST - Save / Update Category Budget for user
// ========================================

app.post("/api/budget/category", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || req.body.userId || "default";
    const { categoryId, limit } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        message: "Category ID is required",
      });
    }

    const budgetLimit = Number(limit);

    if (!budgetLimit || budgetLimit <= 0) {
      return res.status(400).json({
        message: "Budget limit must be greater than 0",
      });
    }

    const budgetData = {
      userId,
      type: "category",
      categoryId,
      limit: budgetLimit,
      updatedAt: new Date(),
    };

    await budgetsCollection.updateOne(
      {
        userId,
        type: "category",
        categoryId,
      },
      {
        $set: budgetData,
      },
      {
        upsert: true,
      }
    );

    console.log(`Category Budget Saved/Updated for User [${userId}]:`, budgetData);

    res.status(200).json({
      message: "Category budget saved successfully!",
      data: budgetData,
    });
  } catch (error) {
    console.error("Error saving category budget:", error);

    res.status(500).json({
      message: "Failed to save category budget",
    });
  }
});

// ========================================
// GET - All Transactions for user
// ========================================

app.get("/api/transactions", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || req.query.userId || "default";

    const transactions = await transactionsCollection
      .find({ userId })
      .sort({ date: -1 })
      .toArray();

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);

    res.status(500).json({
      message: "Failed to fetch transactions",
    });
  }
});

// ========================================
// POST - Add Transaction for user
// ========================================

app.post("/api/transactions", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || req.body.userId || "default";
    const {
      id,
      type,
      title,
      amount,
      categoryId,
      date,
    } = req.body;

    if (!type || !title || !categoryId || !date) {
      return res.status(400).json({
        message: "Missing transaction information",
      });
    }

    const transaction = {
      userId,
      id: id || `tx-${Date.now()}`,
      type,
      title,
      amount: Number(amount) || 0,
      categoryId,
      date,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await transactionsCollection.insertOne(
      transaction
    );

    console.log(`Transaction Saved for User [${userId}]:`, transaction);

    res.status(201).json({
      message: "Transaction saved successfully!",
      data: {
        ...transaction,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Error saving transaction:", error);

    res.status(500).json({
      message: "Failed to save transaction",
    });
  }
});

// ========================================
// PUT - Update Transaction for user
// ========================================

app.put("/api/transactions/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || req.body.userId || "default";
    const { id } = req.params;

    const {
      type,
      title,
      amount,
      categoryId,
      date,
    } = req.body;

    const updateData = {
      userId,
      type,
      title,
      amount: Number(amount) || 0,
      categoryId,
      date,
      updatedAt: new Date(),
    };

    const result = await transactionsCollection.updateOne(
      { id, userId },
      {
        $set: updateData,
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Transaction not found for user",
      });
    }

    console.log(`Transaction Updated for User [${userId}]:`, id);

    res.status(200).json({
      message: "Transaction updated successfully!",
      data: {
        id,
        ...updateData,
      },
    });
  } catch (error) {
    console.error("Error updating transaction:", error);

    res.status(500).json({
      message: "Failed to update transaction",
    });
  }
});

// ========================================
// DELETE - Transaction for user
// ========================================

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"] || req.query.userId || "default";
    const { id } = req.params;

    const result = await transactionsCollection.deleteOne({
      id,
      userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Transaction not found for user",
      });
    }

    console.log(`Transaction Deleted for User [${userId}]:`, id);

    res.status(200).json({
      message: "Transaction deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);

    res.status(500).json({
      message: "Failed to delete transaction",
    });
  }
});

// ========================================
// DELETE - Category Budget for user
// ========================================

app.delete(
  "/api/budget/category/:categoryId",
  async (req, res) => {
    try {
      const userId = req.headers["x-user-id"] || req.query.userId || "default";
      const { categoryId } = req.params;

      const result = await budgetsCollection.deleteOne({
        userId,
        type: "category",
        categoryId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          message: "Category budget not found for user",
        });
      }

      res.status(200).json({
        message: "Category budget deleted successfully!",
      });
    } catch (error) {
      console.error(
        "Error deleting category budget:",
        error
      );

      res.status(500).json({
        message: "Failed to delete category budget",
      });
    }
  }
);

// ========================================
// AI BUDGET ASSISTANT
// ========================================

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a question",
      });
    }

    const userId = req.headers["x-user-id"] || req.body.userId || "default";

    // ----------------------------------------
    // Get latest salary for user
    // ----------------------------------------

    const salaryData = await budgetsCollection.findOne({
      userId,
      type: "salary",
    });

    const salary = salaryData?.salary || 0;

    // ----------------------------------------
    // Get category budgets for user
    // ----------------------------------------

    const categoryBudgets = await budgetsCollection
      .find({
        userId,
        type: "category",
      })
      .toArray();

    // ----------------------------------------
    // Get transactions for user
    // ----------------------------------------

    const transactions = await transactionsCollection
      .find({ userId })
      .sort({ date: -1 })
      .limit(100)
      .toArray();

    // ----------------------------------------
    // Calculate totals
    // ----------------------------------------

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const transaction of transactions) {
      if (transaction.type === "income") {
        totalIncome += Number(transaction.amount) || 0;
      }

      if (transaction.type === "expense") {
        totalExpenses += Number(transaction.amount) || 0;
      }
    }

    const remainingBalance =
      salary + totalIncome - totalExpenses;

    // ----------------------------------------
    // Prepare financial data for AI
    // ----------------------------------------

    const financialData = {
      monthlySalary: salary,

      additionalIncome: totalIncome,

      totalExpenses: totalExpenses,

      remainingBalance: remainingBalance,

      categoryBudgets: categoryBudgets.map((budget) => ({
        categoryId: budget.categoryId,
        limit: budget.limit,
      })),

      transactions: transactions.map((transaction) => ({
        type: transaction.type,
        title: transaction.title,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
        date: transaction.date,
      })),
    };

    // ----------------------------------------
    // AI Prompt
    // ----------------------------------------

    const prompt = `
You are an AI personal budget assistant.

Your job is to help the user understand and manage their personal finances.

IMPORTANT RULES:

1. Use the financial data provided below.
2. Do not invent transactions, salary, expenses, or budgets.
3. Give simple and practical answers.
4. Currency is INR (Indian Rupees).
5. If the user asks about savings, calculate using the provided financial data.
6. If the user asks about expenses, use the actual transactions.
7. If the user asks about a category, use the categoryId and transaction data.
8. If there is not enough data, clearly say that.
9. Do not give risky investment or financial advice.
10. Keep answers easy to understand.

USER QUESTION:
${message}

USER FINANCIAL DATA:
${JSON.stringify(financialData, null, 2)}

Give a helpful answer to the user's question.
`;

    // ----------------------------------------
    // Gemini Request
    // ----------------------------------------

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are a helpful AI personal budget assistant. Always use the provided financial data and never invent financial information.",
        temperature: 0.4,
        maxOutputTokens: 500,
      },
    });

    const answer =
      response.text ||
      "Sorry, I could not generate an answer.";

    console.log("AI Question:", message);
    console.log("AI Answer:", answer);

    res.status(200).json({
      message: "AI response generated successfully",
      answer,
    });
  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      message: "Failed to generate AI response",
      error: error.message,
    });
  }
});

// ========================================
// Start Server
// ========================================

const PORT = 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  });
}

startServer();