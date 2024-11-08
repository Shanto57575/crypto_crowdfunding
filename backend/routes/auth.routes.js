import express from 'express';
import { generateNonce, verifyUser } from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post('/nonce', generateNonce);
authRouter.post('/verify', verifyUser);

export default authRouter;
