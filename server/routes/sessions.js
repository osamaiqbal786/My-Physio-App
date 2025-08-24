const express = require('express');
const jwt = require('jsonwebtoken');
const Session = require('../models/Session');
const Patient = require('../models/Patient');
const router = express.Router();

// Helper function to transform MongoDB document to include id field
const transformSession = (session) => {
  const sessionObj = session.toObject();
  return {
    ...sessionObj,
    id: sessionObj._id.toString(),
    _id: sessionObj._id
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

// Get all sessions for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, startDate, endDate, completed } = req.query;
    
    let query = { userId: req.userId };
    
    if (patientId) query.patientId = patientId;
    if (completed !== undefined) query.completed = completed === 'true';
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const sessions = await Session.find(query)
      .sort({ date: -1, time: -1 });

    const transformedSessions = sessions.map(transformSession);

    res.json({ sessions: transformedSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get sessions for a specific patient
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Verify the patient belongs to the current user
    const patient = await Patient.findOne({
      _id: patientId,
      userId: req.userId
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const sessions = await Session.find({
      userId: req.userId,
      patientId: patientId
    }).sort({ date: -1, time: -1 });

    const transformedSessions = sessions.map(transformSession);

    res.json({ sessions: transformedSessions });
  } catch (error) {
    console.error('Error fetching patient sessions:', error);
    res.status(500).json({ error: 'Failed to fetch patient sessions' });
  }
});

// Get past sessions (completed sessions)
router.get('/past', authenticateToken, async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.userId,
      completed: true
    }).sort({ date: -1, time: -1 });

    const transformedSessions = sessions.map(transformSession);

    res.json({ sessions: transformedSessions });
  } catch (error) {
    console.error('Error fetching past sessions:', error);
    res.status(500).json({ error: 'Failed to fetch past sessions' });
  }
});

// Get upcoming sessions (incomplete sessions)
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.userId,
      completed: false
    }).sort({ date: 1, time: 1 });

    const transformedSessions = sessions.map(transformSession);

    res.json({ sessions: transformedSessions });
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming sessions' });
  }
});

// Get session by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session: transformSession(session) });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Create new session
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, patientName, date, time, notes, completed, amount } = req.body;

    if (!patientId || !patientName || !date || !time) {
      return res.status(400).json({ error: 'Patient ID, patient name, date, and time are required' });
    }

    // Verify the patient belongs to the current user
    const patient = await Patient.findOne({
      _id: patientId,
      userId: req.userId
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const session = new Session({
      userId: req.userId,
      patientId,
      patientName,
      date,
      time,
      notes: notes || '',
      completed: completed || false,
      amount: amount || null
    });

    await session.save();

    res.status(201).json({
      message: 'Session created successfully',
      session: transformSession(session)
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update session
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { patientId, patientName, date, time, notes, completed, amount } = req.body;

    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update fields
    if (patientId) session.patientId = patientId;
    if (patientName) session.patientName = patientName;
    if (date) session.date = date;
    if (time) session.time = time;
    if (notes !== undefined) session.notes = notes;
    if (completed !== undefined) session.completed = completed;
    if (amount !== undefined) session.amount = amount;

    await session.save();

    res.json({
      message: 'Session updated successfully',
      session: transformSession(session)
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete session
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await Session.findByIdAndDelete(req.params.id);

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router;
