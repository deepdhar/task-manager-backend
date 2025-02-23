const express = require("express");
const Task = require("../models/Task");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Create a task
router.post("/", verifyToken, async (req, res) => {
  const { title, description } = req.body;
  const task = new Task({ title, description, user: req.user.id });
  await task.save();
  res.status(201).json(task);
});

// Get all tasks
router.get("/", verifyToken, async (req, res) => {
  const tasks = await Task.find({ user: req.user.id });
  res.json(tasks);
});

// Get a task by ID
router.get("/:id", verifyToken, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task || task.user.toString() !== req.user.id) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

// Update a task
router.put("/:id", verifyToken, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task || task.user.toString() !== req.user.id) return res.status(404).json({ message: "Task not found" });

  task.title = req.body.title || task.title;
  task.description = req.body.description || task.description;
  await task.save();
  res.json(task);
});

// Delete a task
router.delete("/:id", verifyToken, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task || task.user.toString() !== req.user.id) return res.status(404).json({ message: "Task not found" });

  await task.deleteOne();
  res.json({ message: "Task deleted" });
});

module.exports = router;