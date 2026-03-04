const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', taskController.getTasks);
router.get('/all', taskController.getAllTasks);       // Admin: see all users' tasks
router.get('/users', taskController.getAllUsers);     // Admin: see all users summary
router.post('/', taskController.addTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
