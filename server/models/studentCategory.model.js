const mongoose = require("mongoose");

const StudentCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true // Assuming a category must belong to a branch
  }
  // Add any other fields from the PHP version if necessary, e.g., created_at, updated_at handled by timestamps
}, { timestamps: true });

module.exports = mongoose.model("StudentCategory", StudentCategorySchema);
