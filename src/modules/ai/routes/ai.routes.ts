import { Router } from 'express';
import { AiController } from '../controller/ai.controller';
import { AiService } from '../service/ai.service';
import { AiRepository } from '../repository/ai.repository';

const router = Router();

// Dependency Injection
const aiRepository = new AiRepository();
const aiService = new AiService(aiRepository);
const aiController = new AiController(aiService);

// Routes
router.post('/generate-bio', aiController.generateBio);
router.post('/first-message', aiController.firstMessage);
router.post('/suggest-replies', aiController.suggestReplies);

export default router;
