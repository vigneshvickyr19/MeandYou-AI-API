import { Router } from 'express';
import { aiController } from './ai.controller';

const router = Router();

router.post('/generate-bio', (req, res) => aiController.generateBio(req, res));
router.post('/first-message', (req, res) => aiController.suggestFirstMessage(req, res));
router.post('/suggest-replies', (req, res) => aiController.suggestReplies(req, res));

export default router;
