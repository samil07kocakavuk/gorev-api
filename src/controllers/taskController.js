const taskService = require('../services/taskService');

/**
 * Gorev (task) modulu controller'i.
 * Sadece HTTP istek/yanit dongusu ile ilgilenir; is mantigi service katmanindadir.
 */

/**
 * GET /api/tasks
 * Filtreleme, arama, siralama ve sayfalama destekler.
 */
async function listTasks(req, res) {
  const result = await taskService.list(req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
}

/**
 * GET /api/tasks/search?keyword=backend
 * Baslik ve aciklamada anahtar kelime aramasi.
 */
async function searchTasks(req, res) {
  // Ayni parametre birden fazla gonderilirse req.query bir dizi olabilir.
  const rawKeyword =
    typeof req.query.keyword === 'string'
      ? req.query.keyword
      : typeof req.query.q === 'string'
        ? req.query.q
        : '';

  const keyword = rawKeyword.trim();

  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: 'Arama icin "keyword" query parametresi gereklidir.',
    });
  }

  const result = await taskService.list({ ...req.query, keyword });
  res.status(200).json({ success: true, keyword, ...result });
}

/**
 * GET /api/tasks/assignee/:assignee
 * Belirli bir kisiye atanmis gorevleri listeler.
 */
async function getTasksByAssignee(req, res) {
  const result = await taskService.list({ ...req.query, assignee: req.params.assignee });
  res.status(200).json({ success: true, assignee: req.params.assignee, ...result });
}

/**
 * GET /api/tasks/:id
 */
async function getTask(req, res) {
  const task = await taskService.getById(req.params.id);
  res.status(200).json({ success: true, data: task });
}

/**
 * POST /api/tasks
 */
async function createTask(req, res) {
  const task = await taskService.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Gorev basariyla olusturuldu.',
    data: task,
  });
}

/**
 * PUT /api/tasks/:id
 */
async function updateTask(req, res) {
  const task = await taskService.update(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Gorev basariyla guncellendi.',
    data: task,
  });
}

/**
 * DELETE /api/tasks/:id
 */
async function deleteTask(req, res) {
  const task = await taskService.remove(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Gorev basariyla silindi.',
    data: task,
  });
}

module.exports = {
  listTasks,
  searchTasks,
  getTasksByAssignee,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
