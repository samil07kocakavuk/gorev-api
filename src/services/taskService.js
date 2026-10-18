const config = require('../config');
const {
  readJson,
  writeJsonAtomic,
  withLock,
} = require('../utils/fileStore');
const HttpError = require('../utils/HttpError');

/**
 * Gorev (task) verisi ile ilgili tum is mantigi.
 *
 * Depo formati:
 *   { "nextId": 7, "tasks": [ ... ] }
 *
 * nextId sayaci ayrica tutulur; boylece silinen bir gorevin ID'si
 * yeni goreve tekrar verilmez.
 */

const DEFAULT_STORE = { nextId: 1, tasks: [] };

function normalizeStore(store) {
  const tasks = Array.isArray(store && store.tasks) ? store.tasks : [];
  const maxId = tasks.reduce((max, task) => Math.max(max, Number(task.id) || 0), 0);

  const storedNextId = Number(store && store.nextId);
  const nextId =
    Number.isInteger(storedNextId) && storedNextId > maxId ? storedNextId : maxId + 1;

  return { nextId, tasks };
}

async function loadStore() {
  return normalizeStore(await readJson(config.dataFile, DEFAULT_STORE));
}

async function saveStore(store) {
  await writeJsonAtomic(config.dataFile, store);
}

/**
 * Yazma islemlerini kilit altinda calistirir: oku -> degistir -> kaydet.
 */
function mutate(fn) {
  return withLock(config.dataFile, async () => {
    const store = await loadStore();
    const result = await fn(store);
    await saveStore(store);
    return result;
  });
}

function normalize(value) {
  return String(value).trim().toLowerCase();
}

/* ------------------------------ Okuma ------------------------------ */

/**
 * Listeleme + filtreleme + arama + siralama + sayfalama.
 */
async function list(query = {}) {
  const { tasks } = await loadStore();
  let result = [...tasks];

  if (query.status) {
    const status = normalize(query.status);
    result = result.filter((task) => normalize(task.status) === status);
  }

  if (query.priority) {
    const priority = normalize(query.priority);
    result = result.filter((task) => normalize(task.priority) === priority);
  }

  if (query.assignee) {
    const assignee = normalize(query.assignee);
    result = result.filter((task) => normalize(task.assignee) === assignee);
  }

  if (query.project) {
    const project = normalize(query.project);
    result = result.filter((task) => normalize(task.project) === project);
  }

  if (query.keyword) {
    const keyword = normalize(query.keyword);
    result = result.filter((task) =>
      `${task.title} ${task.description || ''}`.toLowerCase().includes(keyword)
    );
  }

  // Siralama
  const allowedSortFields = ['id', 'createdAt', 'updatedAt', 'priority', 'title', 'dueDate'];
  let sortField = 'createdAt';
  let descending = false;

  if (typeof query.sort === 'string') {
    const raw = query.sort.trim();
    const desc = raw.startsWith('-');
    const field = desc ? raw.slice(1) : raw;

    if (allowedSortFields.includes(field)) {
      sortField = field;
      descending = desc;
    }
  }

  const priorityWeight = { high: 3, medium: 2, low: 1 };

  result.sort((a, b) => {
    let valueA = a[sortField];
    let valueB = b[sortField];

    if (sortField === 'priority') {
      valueA = priorityWeight[normalize(valueA)] || 0;
      valueB = priorityWeight[normalize(valueB)] || 0;
    }

    if (valueA === undefined || valueA === null) valueA = '';
    if (valueB === undefined || valueB === null) valueB = '';

    if (valueA < valueB) return descending ? 1 : -1;
    if (valueA > valueB) return descending ? -1 : 1;
    return 0;
  });

  // Sayfalama
  const total = result.length;
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);

  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 100)
      : total || 10;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = result.slice(start, start + limit);

  return { data, total, count: data.length, page, limit, totalPages };
}

async function getById(id) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new HttpError(404, `ID'si ${id} olan gorev bulunamadi.`);
  }

  const { tasks } = await loadStore();
  const task = tasks.find((item) => item.id === numericId);

  if (!task) {
    throw new HttpError(404, `ID'si ${id} olan gorev bulunamadi.`);
  }

  return task;
}

/* ------------------------------ Yazma ------------------------------ */

async function create(payload) {
  return mutate((store) => {
    const now = new Date().toISOString();

    const task = {
      id: store.nextId,
      title: payload.title.trim(),
      description:
        payload.description === undefined || payload.description === null
          ? ''
          : String(payload.description).trim(),
      status: payload.status || 'todo',
      priority: payload.priority || 'medium',
      assignee: payload.assignee.trim(),
      project: payload.project ? String(payload.project).trim() : 'TaskFlow',
      dueDate: payload.dueDate || null,
      createdAt: now,
      updatedAt: now,
    };

    store.tasks.push(task);
    store.nextId += 1;

    return task;
  });
}

async function update(id, payload) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new HttpError(404, `ID'si ${id} olan gorev bulunamadi.`);
  }

  return mutate((store) => {
    const index = store.tasks.findIndex((item) => item.id === numericId);

    if (index === -1) {
      throw new HttpError(404, `ID'si ${id} olan gorev bulunamadi.`);
    }

    const current = store.tasks[index];
    const editableFields = [
      'title',
      'description',
      'priority',
      'status',
      'assignee',
      'project',
      'dueDate',
    ];

    const updates = {};

    editableFields.forEach((field) => {
      if (payload[field] === undefined) {
        return;
      }

      const value = payload[field];

      if (field === 'dueDate') {
        updates.dueDate = value ? String(value).trim() : null;
      } else if (value === null) {
        updates[field] = '';
      } else {
        updates[field] = typeof value === 'string' ? value.trim() : value;
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

    return updated;
  });
}

async function remove(id) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new HttpError(404, `ID'si ${id} olan gorev bulunamadi.`);
  }

  return mutate((store) => {
    const index = store.tasks.findIndex((item) => item.id === numericId);

    if (index === -1) {
      throw new HttpError(404, `ID'si ${id} olan gorev bulunamadi.`);
    }

    const [deleted] = store.tasks.splice(index, 1);

    return deleted;
  });
}

/* ----------------------------- Raporlama ---------------------------- */

async function reportCompleted() {
  const { tasks } = await loadStore();
  const completed = tasks.filter((task) => task.status === 'completed');

  return { count: completed.length, tasks: completed };
}

async function reportPending() {
  const { tasks } = await loadStore();
  const pending = tasks.filter((task) => task.status !== 'completed');

  return { count: pending.length, tasks: pending };
}

async function reportSummary() {
  const { tasks } = await loadStore();

  const byStatus = (status) => tasks.filter((task) => task.status === status).length;
  const byPriority = (priority) =>
    tasks.filter((task) => task.priority === priority).length;

  const assignees = [...new Set(tasks.map((task) => task.assignee))];

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
