const { sql, poolPromise } = require('../config/db');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

exports.registerUser = async (req, res) => {
  const { userName, startaName, fullName, precinctId, dunId, parliamentId, emailId, phoneNumber, userImage, countryCode, password, categoryIds, roleIds, startaId, recyclerCompanyId } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userName', sql.NVarChar, userName)
      .input('startaName', sql.NVarChar, startaName)
      .input('fullName', sql.NVarChar, fullName)
      .input('precinctId', sql.Int, precinctId)
      .input('dunId', sql.Int, dunId)
      .input('parliamentId', sql.Int, parliamentId)
      .input('emailId', sql.NVarChar, emailId)
      .input('phoneNumber', sql.NVarChar, phoneNumber)
      .input('userImage', sql.NVarChar, userImage)
      .input('countryCode', sql.NVarChar, countryCode)
      .input('password', sql.NVarChar, password)
      .input('categoryIds', sql.VarChar, categoryIds.join(','))
      .input('roleIds', sql.VarChar, roleIds.join(','))
      .input('startaId', sql.Int, startaId)
      .input('recyclerCompanyId', sql.Int, recyclerCompanyId)
      .input('createdBy', sql.Int, req.user?.userId || null)
      .execute('RegisterUser');
    res.status(201).json({ id: result.recordset[0].NewUserId });
  } catch (err) {
    logger.error('RegisterUser error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

exports.loginUser = async (req, res) => {
  const { emailId, phoneNumber, password } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('emailId', sql.NVarChar, emailId)
      .input('phoneNumber', sql.NVarChar, phoneNumber)
      .input('password', sql.NVarChar, password)
      .execute('LoginUser');

    if (result.recordsets.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.recordsets[0][0];
    const categoryRoles = result.recordsets[1].map(cr => ({
      categoryId: cr.categoryId,
      categoryName: cr.categoryName,
      roleId: cr.roleId,
      roleName: cr.roleName,
      displayName: cr.displayName
    }));

    const roles = categoryRoles.map(cr => cr.roleName);

    logger.info('LoginUser - Generating token:', {
      userId: user._id,
      roles,
      categoryRoles
    });

    const token = jwt.sign(
      { userId: user._id, roles, categoryRoles },
      process.env.JWT_SECRET
    );

    res.json({ token, user: { ...user, password: undefined }, categoryRoles });
  } catch (err) {
    logger.error('LoginUser error:', err);
    res.status(500).json({ error: 'Failed to login' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('GetAllUsers');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetAllUsers error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('GetUserById');
    if (result.recordsets[0].length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: result.recordsets[0][0],
      categories: result.recordsets[1],
      roles: result.recordsets[2],
    });
  } catch (err) {
    logger.error('GetUserById error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { userName, startaName, fullName, precinctId, dunId, parliamentId, emailId, phoneNumber, userImage, countryCode, categoryIds, roleIds, startaId, recyclerCompanyId } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('userName', sql.NVarChar, userName)
      .input('startaName', sql.NVarChar, startaName)
      .input('fullName', sql.NVarChar, fullName)
      .input('precinctId', sql.Int, precinctId)
      .input('dunId', sql.Int, dunId)
      .input('parliamentId', sql.Int, parliamentId)
      .input('emailId', sql.NVarChar, emailId)
      .input('phoneNumber', sql.NVarChar, phoneNumber)
      .input('userImage', sql.NVarChar, userImage)
      .input('countryCode', sql.NVarChar, countryCode)
      .input('categoryIds', sql.VarChar, categoryIds.join(','))
      .input('roleIds', sql.VarChar, roleIds.join(','))
      .input('startaId', sql.Int, startaId)
      .input('recyclerCompanyId', sql.Int, recyclerCompanyId)
      .input('modifiedBy', sql.Int, req.user.userId)
      .execute('UpdateUser');
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated' });
  } catch (err) {
    logger.error('UpdateUser error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('DeleteUser');
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    logger.error('DeleteUser error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};