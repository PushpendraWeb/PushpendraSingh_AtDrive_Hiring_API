const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt.utils');
const {
  createUser,
  updateUser,
  softDeleteUser,
  getUserById,
  getUserByUsername,
  getAllUsers,
} = require('../model/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const createUserController = async (req, res) => {
  console.log("data : ", req.body);
  try {
    const { name, username, password, status = true } = req.body || {};
    const createdBy = null;

    if (!name || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'name, username and password are required',
      });
    }

    const existing = await getUserByUsername(username);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists',
      });
    }

    const user = await createUser({
      name,
      username,
      password,
      status,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  }
};

const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, status } = req.body;
    const updatedBy = req.user && req.user.user_id ? req.user.user_id : null;

    const userId = Number(id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id',
      });
    }

    const existing = await getUserById(userId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updated = await updateUser(userId, {
      name,
      username,
      password,
      status,
      updatedBy,
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const DeletedBy = req.user && req.user.user_id ? req.user.user_id : null;

    const userId = Number(id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id',
      });
    }

    const existing = await getUserById(userId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const deleted = await softDeleteUser(userId, DeletedBy);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: deleted,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id',
      });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'username and password are required',
      });
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    const token = generateToken({
      user_id: user.user_id,
      username: user.username,
    });
    console.log('token : ', token);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message,
    });
  }
};

const logoutController = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Logout successful. Please discard the token on client side.',
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: error.message,
    });
  }
};

const validateTokenController = async (req, res) => {
  try {
    const { checkTokenStatus } = require('../utils/jwt.utils');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required. Send in Authorization header as: Bearer <token>',
      });
    }

    const tokenStatus = checkTokenStatus(token);

    if (tokenStatus.valid) {
      return res.status(200).json({
        success: true,
        message: tokenStatus.message,
        data: {
          valid: tokenStatus.valid,
          expired: tokenStatus.expired,
          user: {
            user_id: tokenStatus.decoded.user_id,
            username: tokenStatus.decoded.username,
          },
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: tokenStatus.message,
        data: {
          valid: tokenStatus.valid,
          expired: tokenStatus.expired,
          expiredAt: tokenStatus.expiredAt || null,
        },
      });
    }
  } catch (error) {
    console.error('Error validating token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate token',
      error: error.message,
    });
  }
};

module.exports = {
  createUserController,
  updateUserController,
  deleteUserController,
  getUserByIdController,
  getAllUsersController,
  loginController,
  logoutController,
  validateTokenController,
};


