const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      /* ObjectId is MongoDB's id type, and ref: "User" tells Mongoose this id points to a document in the User collection.
required: true means a task can't exist without an owner.*/
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Description cannot be more than 300 characters"],
    },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);