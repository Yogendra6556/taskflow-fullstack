const express = require('express');
const router = express.Router();
const controller = require('../controllers/taskController');

router.get('/board', controller.getBoardData);
router.post('/tasks', controller.createTask);
router.put('/tasks/:id', controller.updateTask);
router.patch('/tasks/:id/move', controller.moveTask);
router.delete('/tasks/:id', controller.deleteTask);

// Assignment Specific SQL Endpoints
router.get('/analytics/counts', controller.getTaskCountsPerColumn);
router.get('/tasks/filter', controller.getTasksByPriority);

module.exports = router;
