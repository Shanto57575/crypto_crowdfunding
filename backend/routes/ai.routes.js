import express from "express";
import { askQuestions, suggestedQuestions } from "../controllers/ai.controller.js";

const aiRouter = express.Router();

aiRouter.post('/ask', askQuestions);
aiRouter.get('/suggested-questions', suggestedQuestions);

export default aiRouter;
