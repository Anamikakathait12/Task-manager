const express = require("express");
const Task = require("../models/Task");
const protect = require("../middleware/auth");
const cleanError = (err) => {
  if (err.name === "ValidationError") {
    return Object.values(err.errors)[0].message;
  }
  return err.message;
};
const router = express.Router();

// every route below now requires a valid token
router.use(protect);

// GET my tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a task
router.post("/", async (req, res) => {
  try {
    const task = await Task.create({
      user: req.user._id,
      title: req.body.title,
      description: req.body.description,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: cleanError(err) });
  }
});

// PATCH update my task
router.patch("/:id", async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, completed },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: cleanError(err) });
  }
});

// DELETE my task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;