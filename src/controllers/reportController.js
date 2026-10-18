const taskService = require('../services/taskService');

async function completed(req, res) {
  const result = await taskService.reportCompleted();
  res.json({ success: true, report: 'completed', ...result });
}

async function pending(req, res) {
  const result = await taskService.reportPending();
  res.json({ success: true, report: 'pending', ...result });
}

async function summary(req, res) {
  const result = await taskService.reportSummary();
  res.json({ success: true, report: 'summary', data: result });
}

module.exports = { completed, pending, summary };
