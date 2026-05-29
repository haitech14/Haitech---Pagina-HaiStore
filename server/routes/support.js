import { Router } from 'express';

import { createSupportTicket } from '../lib/haisupport.js';

export const supportRouter = Router();

supportRouter.post('/tickets', async (req, res, next) => {
  try {
    const { name, email, message } = req.body ?? {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Faltan campos: name, email, message' });
    }

    const ticket = await createSupportTicket({ name, email, message });
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});
