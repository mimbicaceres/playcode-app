import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { prisma } from '../../lib/prisma';
import { BADGE_DEFINITIONS } from '../../lib/gamification';

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

// Catalogo de logros (id, titulo, descripcion) para que el admin elija cuales estan activos.
router.get('/badges', (_req: Request, res: Response) => {
  res.status(200).json({ badges: BADGE_DEFINITIONS.map(({ id, title, description, iconName, color, bgColor }) => ({ id, title, description, iconName, color, bgColor })) });
});

router.patch('/', async (req: Request, res: Response) => {
  const { name, address, contactEmail, xpMultiplier, baseXp, streakBonusXp, disabledBadges } = (req.body ?? {}) as Record<string, unknown>;

  // Ajustes de gamificacion (rangos razonables para que un valor absurdo no rompa el XP de todos).
  if (xpMultiplier !== undefined && (typeof xpMultiplier !== 'number' || !(xpMultiplier >= 0.5 && xpMultiplier <= 5))) {
    return res.status(400).json({ error: 'xpMultiplier debe ser un numero entre 0.5 y 5' });
  }
  for (const [field, value] of [['baseXp', baseXp], ['streakBonusXp', streakBonusXp]] as const) {
    if (value !== undefined && (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 1000)) {
      return res.status(400).json({ error: `${field} debe ser un entero entre 0 y 1000` });
    }
  }
  const knownBadges = new Set(BADGE_DEFINITIONS.map((b) => b.id));
  if (disabledBadges !== undefined && (!Array.isArray(disabledBadges) || disabledBadges.some((id) => typeof id !== 'string' || !knownBadges.has(id)))) {
    return res.status(400).json({ error: 'disabledBadges debe ser una lista de ids de logros validos' });
  }

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
      ...(xpMultiplier !== undefined && { xpMultiplier: xpMultiplier as number }),
      ...(baseXp !== undefined && { baseXp: baseXp as number }),
      ...(streakBonusXp !== undefined && { streakBonusXp: streakBonusXp as number }),
      ...(disabledBadges !== undefined && { disabledBadges: [...new Set(disabledBadges as string[])] }),
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
