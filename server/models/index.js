const config = require("../config/db.config.js");
const Sequelize = require("sequelize");

let sequelize;

if (config.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: config.dialect,
    storage: config.storage,
    logging: console.log,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  });
} else {
  sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
      host: config.HOST,
      dialect: config.dialect,
      logging: console.log,
      pool: {
        max: config.pool.max,
        min: config.pool.min,
        acquire: config.pool.acquire,
        idle: config.pool.idle
      }
    }
  );
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require("./user.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.permission = require("./permission.model.js")(sequelize, Sequelize);
db.staffPrivilege = require("./staffPrivilege.model.js")(sequelize, Sequelize);
db.refreshToken = require("./refreshToken.model.js")(sequelize, Sequelize);
db.student = require("./student.model.js")(sequelize, Sequelize);
db.branch = require("./branch.model.js")(sequelize, Sequelize);
db.class = require("./class.model.js")(sequelize, Sequelize);
db.section = require("./section.model.js")(sequelize, Sequelize);

// Import new models
db.account = require("./account.model.js")(sequelize, Sequelize);
db.advanceSalary = require("./advanceSalary.model.js")(sequelize, Sequelize);
db.attachment = require("./attachment.model.js")(sequelize, Sequelize);
db.attachmentType = require("./attachmentType.model.js")(sequelize, Sequelize);
db.award = require("./award.model.js")(sequelize, Sequelize);
db.book = require("./book.model.js")(sequelize, Sequelize);
db.bookCategory = require("./bookCategory.model.js")(sequelize, Sequelize);
db.bookIssue = require("./bookIssue.model.js")(sequelize, Sequelize);
db.fee = require("./fee.model.js")(sequelize, Sequelize);
db.feeType = require("./feeType.model.js")(sequelize, Sequelize);
db.payment = require("./payment.model.js")(sequelize, Sequelize);
db.loginCredential = require("./loginCredential.model.js")(sequelize, Sequelize);
db.roleGroup = require("./roleGroup.model.js")(sequelize, Sequelize);
db.roleGroupRole = require("./roleGroupRole.model.js")(sequelize, Sequelize);
db.subject = require("./subject.model.js")(sequelize, Sequelize);
db.schoolyear = require("./schoolyear.model.js")(sequelize, Sequelize);
db.enroll = require("./enroll.model.js")(sequelize, Sequelize);

// Define relationships between models
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});

db.user.belongsToMany(db.role, {
  through: "user_roles", 
  foreignKey: "userId",
  otherKey: "roleId"
});

db.permission.belongsToMany(db.role, {
  through: "role_permissions",
  foreignKey: "permissionId",
  otherKey: "roleId"
});

db.role.belongsToMany(db.permission, {
  through: "role_permissions",
  foreignKey: "roleId",
  otherKey: "permissionId"
});

// Refresh token relationship
db.refreshToken.belongsTo(db.user, {
  foreignKey: 'userId', 
  targetKey: 'id'
});
db.user.hasOne(db.refreshToken, {
  foreignKey: 'userId', 
  targetKey: 'id'
});

// Branch, Class, Section relationships
db.branch.hasMany(db.class, {
  foreignKey: 'branch_id',
  as: 'classes'
});

db.class.belongsTo(db.branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

db.class.hasMany(db.section, {
  foreignKey: 'class_id',
  as: 'sections'
});

db.section.belongsTo(db.class, {
  foreignKey: 'class_id',
  as: 'class'
});

db.branch.hasMany(db.section, {
  foreignKey: 'branch_id',
  as: 'sections'
});

db.section.belongsTo(db.branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

db.user.hasMany(db.section, {
  foreignKey: 'teacher_id',
  as: 'teaching_sections'
});

db.section.belongsTo(db.user, {
  foreignKey: 'teacher_id',
  as: 'teacher'
});

// Account relationships
db.branch.hasMany(db.account, {
  foreignKey: 'branch_id',
  as: 'accounts'
});

db.account.belongsTo(db.branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

// Advance Salary relationships
db.user.hasMany(db.advanceSalary, {
  foreignKey: 'staff_id',
  as: 'advance_salaries'
});

db.advanceSalary.belongsTo(db.user, {
  foreignKey: 'staff_id',
  as: 'staff'
});

db.branch.hasMany(db.advanceSalary, {
  foreignKey: 'branch_id',
  as: 'advance_salaries'
});

db.advanceSalary.belongsTo(db.branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

// Attachment relationships
db.attachmentType.hasMany(db.attachment, {
  foreignKey: 'type_id',
  as: 'attachments'
});

db.attachment.belongsTo(db.attachmentType, {
  foreignKey: 'type_id',
  as: 'type'
});

db.branch.hasMany(db.attachment, {
  foreignKey: 'branch_id',
  as: 'attachments'
});

db.attachment.belongsTo(db.branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

// Award relationships
db.user.hasMany(db.award, {
  foreignKey: 'user_id',
  as: 'awards'
});

db.award.belongsTo(db.user, {
  foreignKey: 'user_id',
  as: 'user'
});

db.role.hasMany(db.award, {
  foreignKey: 'role_id',
  as: 'awards'
});

db.award.belongsTo(db.role, {
  foreignKey: 'role_id',
  as: 'role'
});

db.branch.hasMany(db.award, {
  foreignKey: 'branch_id',
  as: 'awards'
});

db.award.belongsTo(db.branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

// Book relationships
db.bookCategory.hasMany(db.book, {
  foreignKey: 'category_id',
  as: 'books'
});

db.book.belongsTo(db.bookCategory, {
  foreignKey: 'category_id',
  as: 'category'
});

db.branch.hasMany(db.book, {
  foreignKey: 'branch_id',
  as: 'books'
});

db.book.belongsTo(db.branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

// Book Issue relationships
db.book.hasMany(db.bookIssue, {
  foreignKey: 'book_id',
  as: 'issues'
});

db.bookIssue.belongsTo(db.book, {
  foreignKey: 'book_id',
  as: 'book'
});

db.user.hasMany(db.bookIssue, {
  foreignKey: 'user_id',
  as: 'book_issues'
});

db.bookIssue.belongsTo(db.user, {
  foreignKey: 'user_id',
  as: 'user'
});

db.role.hasMany(db.bookIssue, {
  foreignKey: 'role_id',
  as: 'book_issues'
});

db.bookIssue.belongsTo(db.role, {
  foreignKey: 'role_id',
  as: 'role'
});

db.branch.hasMany(db.bookIssue, {
  foreignKey: 'branch_id',
  as: 'book_issues'
});

db.bookIssue.belongsTo(db.branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

// Fee Management relationships
db.student.hasMany(db.fee, {
  foreignKey: 'student_id',
  as: 'fees'
});

db.fee.belongsTo(db.student, {
  foreignKey: 'student_id',
  as: 'student'
});

db.feeType.hasMany(db.fee, {
  foreignKey: 'fee_type_id',
  as: 'fees'
});

db.fee.belongsTo(db.feeType, {
  foreignKey: 'fee_type_id',
  as: 'fee_type'
});

db.branch.hasMany(db.fee, {
  foreignKey: 'branch_id',
  as: 'fees'
});

db.fee.belongsTo(db.branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

db.user.hasMany(db.fee, {
  foreignKey: 'created_by',
  as: 'created_fees'
});

db.fee.belongsTo(db.user, {
  foreignKey: 'created_by',
  as: 'creator'
});

db.fee.hasMany(db.payment, {
  foreignKey: 'fee_id',
  as: 'payments'
});

db.payment.belongsTo(db.fee, {
  foreignKey: 'fee_id',
  as: 'fee'
});

db.user.hasMany(db.payment, {
  foreignKey: 'collected_by',
  as: 'collected_payments'
});

db.payment.belongsTo(db.user, {
  foreignKey: 'collected_by',
  as: 'collector'
});

db.branch.hasMany(db.payment, {
  foreignKey: 'branch_id',
  as: 'payments'
});

db.payment.belongsTo(db.branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

db.class.hasMany(db.feeType, {
  foreignKey: 'class_id',
  as: 'fee_types'
});

db.feeType.belongsTo(db.class, {
  foreignKey: 'class_id',
  as: 'class'
});

db.branch.hasMany(db.feeType, {
  foreignKey: 'branch_id',
  as: 'fee_types'
});

db.feeType.belongsTo(db.branch, {
  foreignKey: 'branch_id',
  as: 'branch'
});

// Associations for role groups
// A RoleGroup has many RoleGroupRole
// A RoleGroupRole belongs to RoleGroup and Role

db.roleGroup.hasMany(db.roleGroupRole, { foreignKey: 'role_group_id', as: 'roleGroupRoles' });
db.roleGroupRole.belongsTo(db.roleGroup, { foreignKey: 'role_group_id', as: 'roleGroup' });
db.roleGroupRole.belongsTo(db.role, { foreignKey: 'role_id', as: 'role' });
db.roleGroup.belongsToMany(db.role, {
  through: db.roleGroupRole,
  foreignKey: 'role_group_id',
  otherKey: 'role_id',
  as: 'roles'
});
db.role.belongsToMany(db.roleGroup, {
  through: db.roleGroupRole,
  foreignKey: 'role_id',
  otherKey: 'role_group_id',
  as: 'roleGroups'
});

// Define RBAC roles
db.ROLES = ["admin", "accountant", "teacher", "student", "parent"];

// Add Subject <-> Branch association
if (db.subject.associate) db.subject.associate(db);

// Enroll relationships
// Each enroll belongs to a student
if (db.enroll && db.student) {
  db.enroll.belongsTo(db.student, { foreignKey: 'student_id', as: 'student' });
  db.student.hasMany(db.enroll, { foreignKey: 'student_id', as: 'enrollments' });
}
// Each enroll belongs to a class
if (db.enroll && db.class) {
  db.enroll.belongsTo(db.class, { foreignKey: 'class_id', as: 'class' });
}
// Each enroll belongs to a section
if (db.enroll && db.section) {
  db.enroll.belongsTo(db.section, { foreignKey: 'section_id', as: 'section' });
}
// Each enroll belongs to a session (schoolyear)
if (db.enroll && db.schoolyear) {
  db.enroll.belongsTo(db.schoolyear, { foreignKey: 'session_id', as: 'session' });
}
// Each enroll belongs to a branch
if (db.enroll && db.branch) {
  db.enroll.belongsTo(db.branch, { foreignKey: 'branch_id', as: 'branch' });
}

module.exports = db;