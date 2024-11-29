import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import verifyToken from './middlewares/auth.middleware.js';
import connectDB from './db/dbConnection.js';
import authRouter from './routes/auth.routes.js';
import aiRouter from './routes/ai.routes.js';
import blogRouter from './routes/blog.routes.js';
import postRouter from './routes/post.routes.js';

dotenv.config();

const app = express();

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = ['https://fundchain7.netlify.app', 'http://localhost:5173'];
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);
app.use('/api/blog', blogRouter);
app.use('/api/post', postRouter);

app.get('/', async (req, res) => {
    res.json({ message: " //\\ FUNDCHAIN'S API IS RUNNING FINE //\\ 👌" });
});

app.get('/api/protected', verifyToken, async (req, res) => {
    res.json({ message: 'Access granted to protected route', user: req.user });
});

app.use((err, req, res, next) => {
    console.error('Error occurred: ', err);
    res.status(500).send('Server Error');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
