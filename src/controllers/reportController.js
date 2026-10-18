const taskService = require('../services/taskService');

/**
 * Raporlama servisleri controller'i (istege bagli ileri seviye ozellikler).
 */

/**
 * GET /api/reports/completed
 * Tamamlanan gorevlerin sayisi ve listesi.
 */
async function completed(req, res) {
  const result = await taskService.reportCompleted();
  res.status(200).json({ success: true, report: 'completed', ...result });
}

/**
 * GET /api/reports/pending
 * Bekleyen (tamamlanmamis) gorevlerin sayisi ve listesi.
 */
async function pending(req, res) {
  const result = await taskService.reportPending();
  res.status(200).json({ success: true, report: 'pending', ...result });
}

/**
 * GET /api/reports/summary
 * Genel sistem ozeti: durum/oncelik dagilimi ve atanan kisiler.
 */
async function summary(req, res) {
  const result = await taskService.reportSummary();
  res.status(200).json({ success: true, report: 'summary', data: result });
}

module.exports = { completed, pending, summary };
