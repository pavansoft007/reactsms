const StudentCategory = require("../models/studentCategory.model.js");
const Branch = require("../models/branch.model.js"); // Assuming you have a Branch model

// Create and Save a new StudentCategory
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.name) {
    return res.status(400).send({
      message: "Category name can not be empty"
    });
  }
  if (!req.body.branch_id) {
    return res.status(400).send({
      message: "Branch ID can not be empty"
    });
  }

  try {
    // Check if branch exists
    const branch = await Branch.findById(req.body.branch_id);
    if (!branch) {
      return res.status(404).send({
        message: `Branch not found with id ${req.body.branch_id}`
      });
    }

    // Create a StudentCategory
    const studentCategory = new StudentCategory({
      name: req.body.name,
      branch: req.body.branch_id
    });

    // Save StudentCategory in the database
    const savedCategory = await studentCategory.save();
    res.send(savedCategory);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the StudentCategory."
    });
  }
};

// Retrieve and return all student categories from the database.
exports.findAll = async (req, res) => {
  try {
    const categories = await StudentCategory.find().populate('branch', 'name'); // Populate branch name
    res.send(categories);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving student categories."
    });
  }
};

// Find a single student category with a categoryId
exports.findOne = async (req, res) => {
  try {
    const category = await StudentCategory.findById(req.params.categoryId).populate('branch', 'name');
    if (!category) {
      return res.status(404).send({
        message: "StudentCategory not found with id " + req.params.categoryId
      });
    }
    res.send(category);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).send({
        message: "StudentCategory not found with id " + req.params.categoryId
      });
    }
    return res.status(500).send({
      message: "Error retrieving StudentCategory with id " + req.params.categoryId
    });
  }
};

// Update a student category identified by the categoryId in the request
exports.update = async (req, res) => {
  // Validate Request
  if (!req.body.name) {
    return res.status(400).send({
      message: "Category name can not be empty"
    });
  }

  try {
    const updatedCategory = await StudentCategory.findByIdAndUpdate(req.params.categoryId, {
      name: req.body.name,
      branch: req.body.branch_id // Allow branch update if needed
    }, { new: true }).populate('branch', 'name');

    if (!updatedCategory) {
      return res.status(404).send({
        message: "StudentCategory not found with id " + req.params.categoryId
      });
    }
    res.send(updatedCategory);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).send({
        message: "StudentCategory not found with id " + req.params.categoryId
      });
    }
    return res.status(500).send({
      message: "Error updating StudentCategory with id " + req.params.categoryId
    });
  }
};

// Delete a student category with the specified categoryId in the request
exports.delete = async (req, res) => {
  try {
    const category = await StudentCategory.findByIdAndRemove(req.params.categoryId);
    if (!category) {
      return res.status(404).send({
        message: "StudentCategory not found with id " + req.params.categoryId
      });
    }
    res.send({ message: "StudentCategory deleted successfully!" });
  } catch (err) {
    if (err.kind === 'ObjectId' || err.name === 'NotFound') {
      return res.status(404).send({
        message: "StudentCategory not found with id " + req.params.categoryId
      });
    }
    return res.status(500).send({
      message: "Could not delete StudentCategory with id " + req.params.categoryId
    });
  }
};
