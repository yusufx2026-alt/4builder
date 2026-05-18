import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import providersRouter from "./providers";
import reviewsRouter from "./reviews";
import subscriptionsRouter from "./subscriptions";
import notificationsRouter from "./notifications";
import locationsRouter from "./locations";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(providersRouter);
router.use(reviewsRouter);
router.use(subscriptionsRouter);
router.use(notificationsRouter);
router.use(locationsRouter);
router.use(usersRouter);

export default router;
