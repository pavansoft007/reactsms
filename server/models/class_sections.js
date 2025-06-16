module.exports = (sequelize, Sequelize) => {
  const ClassSection = sequelize.define("class_sections", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    class_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'classes', key: 'id' }
    },
    section_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'sections', key: 'id' }
    }
  }, {
    timestamps: false
  });
  return ClassSection;
};
