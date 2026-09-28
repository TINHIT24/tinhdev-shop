import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';

const rootRouter = Router();

// Register sub-routers
rootRouter.use('/health', healthRoutes);
rootRouter.use('/auth', authRoutes);

export default rootRouter;
