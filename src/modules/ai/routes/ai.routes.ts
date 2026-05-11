import { Router } from 'express';
import { AiController } from '../controller/ai.controller';
import { AiService } from '../service/ai.service';
import { AiRepository } from '../repository/ai.repository';
import { HelpCenterController } from '../controller/help-center.controller';
import { HelpCenterService } from '../service/help-center.service';
import { FaqRepository } from '../repository/faq.repository';

const router = Router();

// Dependency Injection
const aiRepository = new AiRepository();
const faqRepository = new FaqRepository();

const aiService = new AiService(aiRepository);
const helpCenterService = new HelpCenterService(aiRepository, faqRepository);

const aiController = new AiController(aiService);
const helpCenterController = new HelpCenterController(helpCenterService);

// Routes
router.post('/generate-bio', aiController.generateBio);
router.post('/first-message', aiController.firstMessage);
router.post('/suggest-replies', aiController.suggestReplies);
router.post('/analyze-profile', aiController.analyzeProfile);
router.post('/help-center', helpCenterController.processQuery);

export default router;
