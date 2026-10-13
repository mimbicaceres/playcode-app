import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { prisma } from '../../lib/prisma';

const router = Router();
router.use(requireAuth, requireRole('admin'));

const SINGLETON_ID = 'singleton';

// Datos generales del instituto: un solo registro global (esta plataforma
// no modela multiples instituciones). Se crea con upsert la primera vez
// que se pide o se guarda.
router.get('/', async (_req: Request, res: Response) => {
  try {
    const institute = await prisma.institute.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID },
    });
    return res.status(200).json({ institute });
  } catch (error) {
    console.error('getInstitute error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/', async (req: Request, res: Response) => {
  const { name, address, contactEmail } = (req.body ?? {}) as Record<string, unknown>;
  for (const [field, value] of [['name', name], ['address', address], ['contactEmail', contactEmail]] as const) {
    if (value !== undefined && value !== null && typeof value !== 'string') {
      return res.status(400).json({ error: `${field} must be a string` });
    }
  }

  try {
    const data = {
      ...(name !== undefined && { name: typeof name === 'string' ? name.trim() || null : null }),
      ...(address !== undefined && { address: typeof address === 'string' ? address.trim() || null : null }),
      ...(contactEmail !== undefined && { contactEmail: typeof contactEmail === 'string' ? contactEmail.trim() || null : null }),
    };
    const institute = await prisma.institute.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    });
    return res.status(200).json({ institute });
  } catch (error) {
    console.error('updateInstitute error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
