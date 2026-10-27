import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { getInstituteReport } from './reports.service';

const router = Router();

// Reporte general del instituto (solo admin).
router.get('/institute', requireAuth, requireRole('admin'), async (_req, res) => {
  try {
    res.status(200).json({ report: await getInstituteReport() });
  } catch (error) {
    console.error('getInstituteReport error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
