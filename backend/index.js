import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import verifyToken from './middlewares/auth.middleware.js';
import connectDB from './db/dbConnection.js';
import authRouter from './routes/auth.routes.js';

dotenv.config();

const app = express();

// Connect to database
connectDB();

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = ['https://cryptofundchain3.netlify.app', 'http://localhost:5173'];
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(express.json());

app.use('/api/auth', authRouter);

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
