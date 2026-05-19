import { Router } from 'express';
import { ProfileVerificationController } from '../controller/profileVerification.controller';
import { ProfileVerificationService } from '../service/profileVerification.service';
import { ProfileVerificationRepository } from '../repository/profileVerification.repository';

const router = Router();

// Dependency Injection
const repository = new ProfileVerificationRepository();
const service = new ProfileVerificationService(repository);
const controller = new ProfileVerificationController(service);

// Routes
router.post('/verify', controller.verifyProfile);

export default router;
