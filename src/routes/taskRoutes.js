const router = require('express').Router();

const taskController = require('../controllers/taskController');
const {
  validateCreateTask,
  validateUpdateTask,
} = require('../middleware/validateTask');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Gorev (task) rotalari  ->  /api/tasks
 *
 * Not: /search ve /assignee gibi ozel rotalar, /:id rotasindan
 * ONCE tanimlanmalidir. Aksi halde "search" kelimesi id olarak algilanir.
 */

// Ozel rotalar
router.get('/search', asyncHandler(taskController.searchTasks));
router.get('/assignee/:assignee', asyncHandler(taskController.getTasksByAssignee));

// CRUD rotalari
router.get('/', asyncHandler(taskController.listTasks));            // Listeleme
router.post('/', validateCreateTask, asyncHandler(taskController.createTask)); // Ekleme
router.get('/:id', asyncHandler(taskController.getTask));           // Detay
router.put('/:id', validateUpdateTask, asyncHandler(taskController.updateTask)); // Guncelleme
router.delete('/:id', asyncHandler(taskController.deleteTask));     // Silme

module.exports = router;
