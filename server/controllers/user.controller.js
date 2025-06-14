const db = require("../models");
const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;
const bcrypt = require("bcryptjs");

// Retrieve all Users from the database
exports.findAll = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = page * limit;
    
    // Filter parameters
    const name = req.query.name;
    const condition = name ? { name: { [Op.like]: `%${name}%` } } : null;
    
    // Get users with pagination
    const data = await User.findAndCountAll({
      where: condition,
      limit: limit,
      offset: offset,
      order: [['id', 'DESC']],
      attributes: { exclude: ['password'] } // Exclude sensitive data
    });
    
    res.send({
      totalItems: data.count,
      users: data.rows,
      totalPages: Math.ceil(data.count / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving users."
    });
  }
};

// Find a single User with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }, // Exclude sensitive data
      include: [
        {
          model: Role,
          as: "roles",
          through: { attributes: [] }, // Don't include junction table data
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({
        message: `User with id=${id} not found.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving User with id=" + req.params.id
    });
  }
};

// Update a User
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Create update object
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.mobile_no) updateData.mobile_no = req.body.mobile_no;
    if (req.body.password) {
      updateData.password = bcrypt.hashSync(req.body.password, 8);
    }
    
    // Add updated_at timestamp
    updateData.updated_at = new Date();
    
    // Update user
    const result = await User.update(updateData, {
      where: { id: id }
    });
    
    // Update roles if provided
    if (req.body.roles) {
      const user = await User.findByPk(id);
      if (user) {
        const roles = await Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        });
        await user.setRoles(roles);
      }
    }
    
    if (result[0] === 1) {
      res.send({
        message: "User was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update User with id=${id}. Maybe User was not found or no changes were made.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating User with id=" + req.params.id
    });
  }
};

// Delete a User
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const result = await User.destroy({
      where: { id: id }
    });
    
    if (result === 1) {
      res.send({
        message: "User was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete User with id=${id}. Maybe User was not found!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Could not delete User with id=" + req.params.id
    });
  }
};

// Test endpoints for different roles
exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};