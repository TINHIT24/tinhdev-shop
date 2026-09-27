import { Router } from 'express';
import healthRoutes from './health.routes';

const rootRouter = Router();

// Register sub-routers
rootRouter.use('/health', healthRoutes);



export default rootRouter;
