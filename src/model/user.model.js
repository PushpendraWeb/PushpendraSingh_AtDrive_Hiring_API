const bcrypt = require('bcryptjs');
const { sequelize, DataTypes } = require('../config/sequelize');

const User = sequelize.define(
  'User',
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    DeletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    DeletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

User.addHook('beforeCreate', async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.addHook('beforeUpdate', async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

async function createUser({ name, username, password, status = true, createdBy = null }) {
  const user = await User.create({
    name,
    username,
    password,
    status,
    createdBy,
  });

  const { password: _, ...plain } = user.get({ plain: true });
  return plain;
}

async function updateUser(userId, { name, username, password, status, updatedBy = null }) {
  const user = await User.findOne({
    where: { user_id: userId, DeletedAt: null },
  });

  if (!user) {
    return null;
  }

  if (name !== undefined) user.name = name;
  if (username !== undefined) user.username = username;
  if (password !== undefined) user.password = password;
  if (status !== undefined) user.status = status;
  if (updatedBy !== undefined) user.updatedBy = updatedBy;

  await user.save();

  const { password: _, ...plain } = user.get({ plain: true });
  return plain;
}

async function softDeleteUser(userId, deletedBy = null) {
  const user = await User.findOne({
    where: { user_id: userId, DeletedAt: null },
  });

  if (!user) {
    return null;
  }

  user.status = false;
  user.DeletedBy = deletedBy;
  user.DeletedAt = new Date();

  await user.save();

  const { password: _, ...plain } = user.get({ plain: true });
  return plain;
}

async function getUserById(userId) {
  const user = await User.findOne({
    where: { user_id: userId, DeletedAt: null },
  });

  if (!user) return null;

  const { password: _, ...plain } = user.get({ plain: true });
  return plain;
}

async function getUserByUsername(username) {
  const user = await User.findOne({
    where: { username, DeletedAt: null },
  });

  return user ? user.get({ plain: true }) : null;
}

async function getAllUsers() {
  const users = await User.findAll({
    where: { DeletedAt: null },
    attributes: {
      exclude: ['password'],
    },
  });

  return users.map((u) => u.get({ plain: true }));
}

module.exports = {
  User,
  createUser,
  updateUser,
  softDeleteUser,
  getUserById,
  getUserByUsername,
  getAllUsers,
};
