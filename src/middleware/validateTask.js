/**
 * Gorev (task) verisi icin dogrulama (validation) middleware'leri.
 * Gecersiz veri durumunda 400 Bad Request ve aciklayici mesaj doner.
 */

const ALLOWED_STATUS = ['todo', 'in-progress', 'completed'];
const ALLOWED_PRIORITY = ['low', 'medium', 'high'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Tek bir alani dogrular ve hatayi errors dizisine ekler.
 */
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
      if (value !== undefined && value !== null && typeof value !== 'string') {
        errors.push('description metin olmalidir.');
      } else if (typeof value === 'string' && value.length > 500) {
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

    case 'dueDate':
      if (value !== undefined && value !== null && value !== '') {
        const parsed = Date.parse(value);
        if (Number.isNaN(parsed)) {
          errors.push('dueDate gecerli bir tarih olmalidir (or: 2026-11-01).');
        }
      }
      break;

    default:
      break;
  }
}

/**
 * POST /api/tasks  -> yeni gorev olusturma dogrulamasi
 */
function validateCreateTask(req, res, next) {
  const body = req.body || {};
  const errors = [];

  validateField('title', body.title, errors, { required: true });
  validateField('assignee', body.assignee, errors, { required: true });
  validateField('description', body.description, errors);
  validateField('priority', body.priority, errors);
  validateField('status', body.status, errors);
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
  const body = req.body || {};
  const editableFields = ['title', 'description', 'priority', 'status', 'assignee', 'dueDate'];
  const presentFields = editableFields.filter((f) => body[f] !== undefined);

  if (presentFields.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Guncellenecek en az bir alan gonderilmelidir.',
      errors: [`Gecerli alanlar: ${editableFields.join(', ')}.`],
    });
  }

  const errors = [];
  presentFields.forEach((field) => {
    validateField(field, body[field], errors, { required: field === 'title' || field === 'assignee' });
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
