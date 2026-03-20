// Express API stub for secure XP updates
// This would be deployed as a Firebase Function or Express server

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://your-project.firebaseio.com'
});

const db = admin.firestore();

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// API endpoint to update user XP
app.post('/api/update-xp', verifyToken, async (req, res) => {
  try {
    const { userId, xpAmount, reason, metadata } = req.body;
    
    // Validate input
    if (!userId || !xpAmount || typeof xpAmount !== 'number' || xpAmount <= 0) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    
    // Check if user is updating their own XP or is an admin
    if (req.user.uid !== userId && !req.user.admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Validate XP amount limits
    const maxXpPerUpdate = 100;
    if (xpAmount > maxXpPerUpdate) {
      return res.status(400).json({ error: 'XP amount exceeds limit' });
    }
    
    // Update user XP atomically
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      xp: admin.firestore.FieldValue.increment(xpAmount),
      lastXpUpdate: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Log XP transaction
    await db.collection('xpTransactions').add({
      userId,
      xpAmount,
      reason: reason || 'Manual update',
      metadata: metadata || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid
    });
    
    // Get updated user data
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    res.json({
      success: true,
      newXp: userData.xp,
      xpAdded: xpAmount,
      message: `Successfully added ${xpAmount} XP`
    });
    
  } catch (error) {
    console.error('Error updating XP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to complete quiz and award XP
app.post('/api/complete-quiz', verifyToken, async (req, res) => {
  try {
    const { quizId, answers, score } = req.body;
    const userId = req.user.uid;
    
    // Validate input
    if (!quizId || !answers || typeof score !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    
    // Check if quiz exists
    const quizDoc = await db.collection('quizzes').doc(quizId).get();
    if (!quizDoc.exists) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Calculate XP based on score
    const baseXp = 20;
    const bonusXp = Math.floor((score / 100) * 10); // Up to 10 bonus XP
    const totalXp = baseXp + bonusXp;
    
    // Save quiz attempt
    const attemptRef = await db.collection('quizAttempts').add({
      userId,
      quizId,
      answers,
      score,
      xpEarned: totalXp,
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update user XP
    await db.collection('users').doc(userId).update({
      xp: admin.firestore.FieldValue.increment(totalXp),
      lastXpUpdate: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Add to recent activity
    await db.collection('users').doc(userId).update({
      recentActivity: admin.firestore.FieldValue.arrayUnion({
        type: 'quiz_completed',
        description: `Completed quiz (${score}% score)`,
        xpEarned: totalXp,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        quizId,
        attemptId: attemptRef.id
      })
    });
    
    res.json({
      success: true,
      xpEarned: totalXp,
      score,
      attemptId: attemptRef.id
    });
    
  } catch (error) {
    console.error('Error completing quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to save session notes
app.post('/api/save-session-notes', verifyToken, async (req, res) => {
  try {
    const { sessionId, notes } = req.body;
    const userId = req.user.uid;
    
    // Validate input
    if (!sessionId || !notes) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    
    // Check if user is part of this session
    const sessionDoc = await db.collection('sessions').doc(sessionId).get();
    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const sessionData = sessionDoc.data();
    if (sessionData.mentorId !== userId && sessionData.learnerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update session notes
    await db.collection('sessions').doc(sessionId).update({
      notes: notes.trim(),
      notesUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      notesUpdatedBy: userId
    });
    
    res.json({
      success: true,
      message: 'Notes saved successfully'
    });
    
  } catch (error) {
    console.error('Error saving session notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
