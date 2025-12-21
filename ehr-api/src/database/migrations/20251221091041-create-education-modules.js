'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('education_modules', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      category: {
        type: Sequelize.STRING,
      },
      trimester: {
        type: Sequelize.STRING,
      },
      contentType: {
        type: Sequelize.STRING,
      },
      duration: {
        type: Sequelize.STRING,
      },
      required: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      url: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('education_modules');
  },
};
