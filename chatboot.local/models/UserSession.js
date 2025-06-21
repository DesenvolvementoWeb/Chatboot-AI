const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'  // ou sua conexão real se usa MySQL, etc.
});

const UserSession = sequelize.define('UserSession', {
  chatId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  unidade: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});
module.exports = { UserSession, sequelize };
