import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { logAudit } from '../services/auditService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'resqgrid_secret_jwt_key_hackathon_2026_demo';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      departmentCode: user.departmentCode
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const registerCitizen = async (req, res, next) => {
  try {
    const { name, email, phone, password, address, location } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password: hashedPassword,
      address: address || '',
      location: location || { lat: 12.9716, lng: 77.5946, areaName: 'Central District' },
      role: 'citizen'
    });

    const token = generateToken(user);
    await logAudit({
      actorId: user._id,
      actorName: user.name,
      actorRole: 'citizen',
      action: 'CITIZEN_REGISTERED',
      details: `Citizen account created: ${user.name} (${user.email})`
    });

    res.status(201).json({
      success: true,
      message: 'Citizen registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        location: user.location,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide identifier/email and password.' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { departmentCode: identifier.toUpperCase() },
        { phone: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    const token = generateToken(user);
    await logAudit({
      actorId: user._id,
      actorName: user.name,
      actorRole: user.role,
      action: 'USER_LOGIN',
      details: `${user.name} logged into ${user.role} console.`
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentCode: user.departmentCode,
        departmentName: user.departmentName,
        phone: user.phone,
        address: user.address,
        location: user.location
      }
    });
  } catch (err) {
    next(err);
  }
};

export const demoLogin = async (req, res, next) => {
  try {
    const { role, departmentCode } = req.body;
    let query = {};

    if (role === 'citizen') {
      query = { role: 'citizen' };
    } else if (role === 'department') {
      query = { role: 'department' };
      if (departmentCode) {
        query.departmentCode = departmentCode;
      }
    } else if (role === 'command_center') {
      query = { role: 'command_center' };
    } else if (role === 'admin') {
      query = { role: 'admin' };
    } else {
      query = { role: 'citizen' };
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: `Demo user for role '${role}' not found.` });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: `Logged in as demo ${user.role}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentCode: user.departmentCode,
        departmentName: user.departmentName,
        phone: user.phone,
        address: user.address,
        location: user.location
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentCode: user.departmentCode,
        departmentName: user.departmentName,
        phone: user.phone,
        address: user.address,
        location: user.location
      }
    });
  } catch (err) {
    next(err);
  }
};

export default { registerCitizen, login, demoLogin, getMe };
