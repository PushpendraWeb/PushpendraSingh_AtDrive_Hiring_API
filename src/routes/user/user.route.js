const express = require('express');
const { auth } = require('../../middleware/auth.middleware');
const {
  createUserController,
  updateUserController,
  deleteUserController,
  getUserByIdController,
  getAllUsersController,
  loginController,
  logoutController,
  validateTokenController,
} = require('../../controllers/user.controller');

const router = express.Router();

router.post('/create', createUserController);
router.put('/update/:id',auth, updateUserController);
router.delete('/delete/:id',auth, deleteUserController);
router.get('/getbyid/:id',auth, getUserByIdController);
router.get('/getall',auth, getAllUsersController);
router.post('/login', loginController);
router.post('/validate-token', validateTokenController);
router.post('/logout', auth, logoutController);

module.exports = router;
