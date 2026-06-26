import { Router } from 'express';

import { resolveUserFromToken } from '../lib/auth-store.js';
import {
  createForumReply,
  createForumThread,
  markThreadSolved,
  readFeaturedMembers,
  readForumCategories,
  readForumEvents,
  readForumFirmwareIndex,
  readForumManualsIndex,
  readForumMembers,
  readForumStats,
  readForumThreadBySlug,
  readForumThreads,
  readLatestForumActivity,
  readPinnedThreads,
  readPopularThreads,
} from '../lib/forum-store.js';
import { isSupabaseAuthEnabled, verifySupabaseToken } from '../lib/supabase-auth.js';

export const forumRouter = Router();

async function requireSupabaseUser(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Inicia sesión con tu cuenta HaiStore para continuar' });
  }

  if (!isSupabaseAuthEnabled()) {
    return res.status(503).json({ error: 'Foro no disponible sin Supabase' });
  }

  const user = await verifySupabaseToken(token);
  if (!user?.id) {
    const demoUser = await resolveUserFromToken(token);
    if (demoUser && !demoUser.id) {
      return res.status(403).json({
        error: 'Las publicaciones del foro requieren una cuenta Supabase, no sesión demo',
      });
    }
    return res.status(401).json({ error: 'Sesión no válida' });
  }

  req.user = user;
  next();
}

function handleForumError(error, res, next) {
  if (error?.statusCode === 503) {
    return res.status(503).json({ error: error.message });
  }
  if (error instanceof Error && error.message) {
    return res.status(400).json({ error: error.message });
  }
  next(error);
}

forumRouter.get('/stats', async (_req, res, next) => {
  try {
    res.json(await readForumStats());
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.get('/categories', async (_req, res, next) => {
  try {
    res.json({ categories: await readForumCategories() });
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.get('/threads', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const sort = req.query.sort === 'popular' ? 'popular' : 'recent';
    const solved =
      req.query.solved === 'open' || req.query.solved === 'solved' ? req.query.solved : undefined;
    const result = await readForumThreads({
      categorySlug: typeof req.query.category === 'string' ? req.query.category : undefined,
      kind: typeof req.query.kind === 'string' ? req.query.kind : undefined,
      solved,
      sort,
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      limit,
      offset,
    });
    res.json(result);
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.get('/threads/:slug', async (req, res, next) => {
  try {
    const result = await readForumThreadBySlug(req.params.slug, { incrementViews: true });
    if (!result) return res.status(404).json({ error: 'Tema no encontrado' });
    res.json(result);
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.post('/threads', requireSupabaseUser, async (req, res, next) => {
  try {
    const { categorySlug, title, body, tags, kind } = req.body ?? {};
    if (!categorySlug || !title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: 'Categoría, título y contenido son obligatorios' });
    }
    const thread = await createForumThread({
      authorId: req.user.id,
      categorySlug: String(categorySlug),
      title: String(title),
      body: String(body),
      tags,
      kind: typeof kind === 'string' ? kind : 'discussion',
    });
    res.status(201).json({ thread });
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.post('/threads/:slug/replies', requireSupabaseUser, async (req, res, next) => {
  try {
    const { body } = req.body ?? {};
    if (!body?.trim()) {
      return res.status(400).json({ error: 'La respuesta no puede estar vacía' });
    }
    const reply = await createForumReply({
      authorId: req.user.id,
      threadSlug: req.params.slug,
      body: String(body),
    });
    res.status(201).json({ reply });
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.get('/popular', async (_req, res, next) => {
  try {
    res.json({ topics: await readPopularThreads() });
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.get('/members/featured', async (_req, res, next) => {
  try {
    res.json({ members: await readFeaturedMembers() });
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.get('/members', async (_req, res, next) => {
  try {
    res.json({ members: await readForumMembers() });
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.get('/events', async (_req, res, next) => {
  try {
    res.json({ events: await readForumEvents() });
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.get('/latest', async (_req, res, next) => {
  try {
    res.json({ posts: await readLatestForumActivity() });
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.get('/pinned', async (_req, res, next) => {
  try {
    res.json({ threads: await readPinnedThreads() });
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.get('/firmware', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const threadLimit = Math.min(Number(req.query.threadLimit) || 15, 50);
    const threadOffset = Math.max(Number(req.query.threadOffset) || 0, 0);
    const result = await readForumFirmwareIndex({
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      limit,
      threadLimit,
      threadOffset,
    });
    res.json(result);
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.get('/manuals', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 8, 20);
    const result = await readForumManualsIndex({
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      limit,
    });
    res.json(result);
  } catch (error) {
    handleForumError(error, res, next);
  }
});

forumRouter.post('/threads/:slug/solve', requireSupabaseUser, async (req, res, next) => {
  try {
    const { replyId } = req.body ?? {};
    if (!replyId) {
      return res.status(400).json({ error: 'replyId es obligatorio' });
    }
    const thread = await markThreadSolved({
      threadSlug: req.params.slug,
      replyId: String(replyId),
      userId: req.user.id,
      userEmail: req.user.email,
    });
    res.json({ thread });
  } catch (error) {
    handleForumError(error, res, next);
  }
});
