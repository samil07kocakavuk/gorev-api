/**
 * Gorev (task) verisi icin dogrulama (validation) middleware'leri.
 * Gecersiz veri durumunda 400 Bad Request ve aciklayici mesaj doner.
 */

const ALLOWED_STATUS = ['todo', 'in-progress', 'completed'];
const ALLOWED_PRIORITY = ['low', 'medium', 'high'];

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateField(field, value, errors, { required = false } = {}) {
  switch (field) {
    case 'title':
      if (value === undefined || value === null || value === '') {
        if (required) errors.push('title alani zorunludur.');
      } else if (!isNonEmptyString(value)) {
        errors.push('title bos olamaz ve metin olmalidir.');
      } else if (value.trim().length > 100) {
        errors.push('title en fazla 100 karakter olabilir.');
      }
      break;

    case 'description':
      if (value === undefined || value === null) {
        break;
      }
      if (typeof value !== 'string') {
        errors.push('description metin olmalidir.');
      } else if (value.length > 500) {
        errors.push('description en fazla 500 karakter olabilir.');
      }
      break;

    case 'priority':
      if (value !== undefined && value !== null && !ALLOWED_PRIORITY.includes(value)) {
        errors.push(
          `priority su degerlerden biri olmalidir: ${ALLOWED_PRIORITY.join(', ')}.`
        );
      }
      break;

    case 'status':
      if (value !== undefined && value !== null && !ALLOWED_STATUS.includes(value)) {
        errors.push(
          `status su degerlerden biri olmalidir: ${ALLOWED_STATUS.join(', ')}.`
        );
      }
      break;

    case 'assignee':
      if (value === undefined || value === null || value === '') {
        if (required) errors.push('assignee alani zorunludur.');
      } else if (!isNonEmptyString(value)) {
        errors.push('assignee bos olamaz ve metin olmalidir.');
      } else if (value.trim().length > 50) {
        errors.push('assignee en fazla 50 karakter olabilir.');
      }
      break;

    case 'project':
      if (value === null) {
        break;
      }
      if (value !== undefined && typeof value !== 'string') {
        errors.push('project metin olmalidir.');
      } else if (typeof value === 'string' && value.trim().length > 100) {
        errors.push('project en fazla 100 karakter olabilir.');
      }
      break;

    case 'dueDate':
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
          errors.push('dueDate gecerli bir tarih olmalidir (or: 2026-11-01).');
        }
      }
      break;

    default:
      break;
  }
}

function rejectInvalidBody(res) {
  return res.status(400).json({
    success: false,
    message: 'Gecersiz istek verisi.',
    errors: ['Istek govdesi bir JSON nesnesi olmalidir.'],
  });
}

/**
 * POST /api/tasks -> yeni gorev olusturma dogrulamasi
 */
function validateCreateTask(req, res, next) {
  if (!isPlainObject(req.body)) {
    return rejectInvalidBody(res);
  }

  const body = req.body;
  const errors = [];

  validateField('title', body.title, errors, { required: true });
  validateField('assignee', body.assignee, errors, { required: true });
  validateField('description', body.description, errors);
  validateField('priority', body.priority, errors);
  validateField('status', body.status, errors);
  validateField('project', body.project, errors);
  validateField('dueDate', body.dueDate, errors);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Gecersiz istek verisi.',
      errors,
    });
  }

  return next();
}

/**
 * PUT /api/tasks/:id -> gorev guncelleme dogrulamasi (kismi guncelleme destekler)
 */
function validateUpdateTask(req, res, next) {
  if (!isPlainObject(req.body)) {
    return rejectInvalidBody(res);
  }

  const body = req.body;
  const editableFields = [
    'title',
    'description',
    'priority',
    'status',
    'assignee',
    'project',
    'dueDate',
  ];

  const presentFields = editableFields.filter((field) => body[field] !== undefined);

  if (presentFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Guncellenecek en az bir alan gonderilmelidir.',
      errors: [`Gecerli alanlar: ${editableFields.join(', ')}.`],
    });
  }

  const errors = [];
  presentFields.forEach((field) => {
    const required = field === 'title' || field === 'assignee';
    validateField(field, body[field], errors, { required });
  });

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Gecersiz istek verisi.',
      errors,
    });
  }

  return next();
}

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  ALLOWED_STATUS,
  ALLOWED_PRIORITY,
};
