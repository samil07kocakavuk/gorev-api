const config = require('../config');
const { readJson, writeJson } = require('../utils/fileStore');
const HttpError = require('../utils/HttpError');

/**
 * Gorev (task) verisi ile ilgili tum is mantigi (business logic).
 * Controller katmani sadece HTTP ile ilgilenir, veri islemleri burada yapilir.
 */

const EMPTY_STORE = { tasks: [] };

/**
 * Depoyu okur ve { tasks: [] } formatini garanti eder.
 */
async function loadStore() {
  const store = await readJson(config.dataFile, EMPTY_STORE);
  if (!store || !Array.isArray(store.tasks)) {
    return { tasks: [] };
  }
  return store;
}

async function saveStore(store) {
  await writeJson(config.dataFile, store);
}

function nextId(tasks) {
  return tasks.reduce((max, t) => (t.id > max ? t.id : max), 0) + 1;
}

/**
 * Gorev listesi + filtreleme, arama, siralama ve sayfalama.
 *
 * Desteklenen query parametreleri:
 *   status, priority, assignee, keyword, project
 *   sort=createdAt|updatedAt|priority|title  (onunde - ile azalan: sort=-createdAt)
 *   page, limit
 */
async function list(query = {}) {
  const { tasks } = await loadStore();

  let result = [...tasks];

  // --- Filtreleme ---
  if (query.status) {
    result = result.filter((t) => t.status === query.status);
  }
  if (query.priority) {
    result = result.filter((t) => t.priority === query.priority);
  }
  if (query.assignee) {
    result = result.filter(
      (t) => t.assignee.toLowerCase() === String(query.assignee).toLowerCase()
    );
  }
  if (query.project) {
    result = result.filter(
      (t) => t.project && t.project.toLowerCase() === String(query.project).toLowerCase()
    );
  }
  if (query.keyword) {
    const keyword = String(query.keyword).toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(keyword) ||
        (t.description || '').toLowerCase().includes(keyword)
    );
  }

  // --- Siralama ---
  const sortRaw = query.sort || 'createdAt';
  const descending = sortRaw.startsWith('-');
  const sortField = descending ? sortRaw.slice(1) : sortRaw;

  const sortableFields = ['createdAt', 'updatedAt', 'priority', 'title', 'dueDate', 'id'];
  if (sortableFields.includes(sortField)) {
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    result.sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];

      if (sortField === 'priority') {
        va = priorityOrder[va] || 0;
        vb = priorityOrder[vb] || 0;
      }

      if (va === undefined || va === null) va = '';
      if (vb === undefined || vb === null) vb = '';

      if (va < vb) return descending ? 1 : -1;
      if (va > vb) return descending ? -1 : 1;
      return 0;
    });
  }

  // --- Sayfalama ---
  const total = result.length;
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || total || 1));
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  const data = total === 0 ? [] : result.slice(start, start + limit);

  return { data, total, count: data.length, page, limit, totalPages };
}

async function getById(id) {
  const { tasks } = await loadStore();
  const task = tasks.find((t) => t.id === Number(id));

  if (!task) {
    throw new HttpError(404, `ID'si ${id} olan gorev bulunamadi.`);
  }

  return task;
}

async function create(payload) {
  const store = await loadStore();
  const now = new Date().toISOString();

  const task = {
    id: nextId(store.tasks),
    title: payload.title.trim(),
    description: payload.description ? String(payload.description).trim() : '',
    status: payload.status || 'todo',
    priority: payload.priority || 'medium',
    assignee: payload.assignee.trim(),
    project: payload.project || 'TaskFlow',
    dueDate: payload.dueDate || null,
    createdAt: now,
    updatedAt: now,
  };

  store.tasks.push(task);
  await saveStore(store);

  return task;
}

async function update(id, payload) {
  const store = await loadStore();
  const index = store.tasks.findIndex((t) => t.id === Number(id));

  if (index === -1) {
    throw new HttpError(404, `ID'si ${id} olan gorev bulunamadi.`);
  }

  const current = store.tasks[index];
  const editableFields = ['title', 'description', 'priority', 'status', 'assignee', 'project', 'dueDate'];

  const updates = {};
  editableFields.forEach((field) => {
    if (payload[field] !== undefined) {
      updates[field] =
        typeof payload[field] === 'string' ? payload[field].trim() : payload[field];
    }
  });

  const updated = {
    ...current,
    ...updates,
    id: current.id, // ID degistirilemez
    createdAt: current.createdAt, // olusturma tarihi korunur
    updatedAt: new Date().toISOString(),
  };

  store.tasks[index] = updated;
  await saveStore(store);

  return updated;
}

async function remove(id) {
  const store = await loadStore();
  const index = store.tasks.findIndex((t) => t.id === Number(id));

  if (index === -1) {
    throw new HttpError(404, `ID'si ${id} olan gorev bulunamadi.`);
  }

  const [deleted] = store.tasks.splice(index, 1);
  await saveStore(store);

  return deleted;
}

/* ----------------------------- Raporlama ----------------------------- */

async function reportCompleted() {
  const { tasks } = await loadStore();
  const completed = tasks.filter((t) => t.status === 'completed');

  return {
    count: completed.length,
    tasks: completed,
  };
}

async function reportPending() {
  const { tasks } = await loadStore();
  const pending = tasks.filter((t) => t.status !== 'completed');

  return {
    count: pending.length,
    tasks: pending,
  };
}

async function reportSummary() {
  const { tasks } = await loadStore();

  const byStatus = (status) => tasks.filter((t) => t.status === status).length;
  const byPriority = (priority) => tasks.filter((t) => t.priority === priority).length;

  const assignees = [...new Set(tasks.map((t) => t.assignee))];

  return {
    total: tasks.length,
    completed: byStatus('completed'),
    pending: byStatus('todo') + byStatus('in-progress'),
    byStatus: {
      todo: byStatus('todo'),
      'in-progress': byStatus('in-progress'),
      completed: byStatus('completed'),
    },
    byPriority: {
      high: byPriority('high'),
      medium: byPriority('medium'),
      low: byPriority('low'),
    },
    assignees,
    assigneeCount: assignees.length,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  reportCompleted,
  reportPending,
  reportSummary,
};
