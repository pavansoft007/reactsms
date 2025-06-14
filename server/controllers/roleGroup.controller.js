// Controller for Role Groups
const db = require("../models");
const RoleGroup = db.roleGroup;

// Get all role groups
exports.findAll = async (req, res) => {
  try {
    const groups = await RoleGroup.findAll();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single role group by ID
exports.findOne = async (req, res) => {
  try {
    const group = await RoleGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ message: "Role group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new role group
exports.create = async (req, res) => {
  try {
    const newGroup = await RoleGroup.create(req.body);
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a role group
exports.update = async (req, res) => {
  try {
    const [updated] = await RoleGroup.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: "Role group not found" });
    const updatedGroup = await RoleGroup.findByPk(req.params.id);
    res.json(updatedGroup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a role group
exports.delete = async (req, res) => {
  try {
    const deleted = await RoleGroup.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Role group not found" });
    res.json({ message: "Role group deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
