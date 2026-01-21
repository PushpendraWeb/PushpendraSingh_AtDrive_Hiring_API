const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const sequelize = new Sequelize(
  process.env.MYSQL_DB || 'test',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = {
  sequelize,
  DataTypes,
};


