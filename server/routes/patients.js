const express = require('express');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const router = express.Router();

// Helper function to transform MongoDB document to include id field
const transformPatient = (patient) => {
  const patientObj = patient.toObject();
  return {
    ...patientObj,
    id: patientObj._id.toString(),
    _id: patientObj._id
  };
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all patients for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const patients = await Patient.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    const transformedPatients = patients.map(transformPatient);

    res.json({ patients: transformedPatients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ patient: transformPatient(patient) });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Create new patient
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, contactNumber } = req.body;

    if (!name || !contactNumber) {
      return res.status(400).json({ error: 'Name and contact number are required' });
    }

    const patient = new Patient({
      userId: req.userId,
      name,
      contactNumber
    });

    await patient.save();

    res.status(201).json({
      message: 'Patient created successfully',
      patient: transformPatient(patient)
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// Update patient
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, contactNumber } = req.body;

    const patient = await Patient.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (name) patient.name = name;
    if (contactNumber) patient.contactNumber = contactNumber;

    await patient.save();

    res.json({
      message: 'Patient updated successfully',
      patient: transformPatient(patient)
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// Delete patient
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

module.exports = router;
