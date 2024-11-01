import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { ethers } from 'ethers'

dotenv.config()

const app = express()

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// User Schema
const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true
    },
    nonce: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Generate Random Nonce
const generateNonce = () => {
    return Math.floor(Math.random() * 1000000).toString();
};


app.post('/api/auth/nonce', async (req, res) => {
    try {
        const { address } = req.body;
        const normalizedAddress = ethers.getAddress(address); // Checksum address

        let user = await User.findOne({ walletAddress: normalizedAddress });
        const nonce = generateNonce();

        if (!user) {
            // Create new user if doesn't exist
            user = new User({
                walletAddress: normalizedAddress,
                nonce
            });
        } else {
            // Update existing user's nonce
            user.nonce = nonce;
        }

        await user.save();
        res.json({ nonce });
    } catch (error) {
        res.status(500).json({ message: 'Error generating nonce' });
    }
});

app.post('/api/auth/verify', async (req, res) => {
    try {
        const { address, signature } = req.body;
        const normalizedAddress = ethers.getAddress(address);

        const user = await User.findOne({ walletAddress: normalizedAddress });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Message that was signed
        const message = `Sign this unique nonce to verify your wallet: ${user.nonce}`;

        // Recover the address from the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (normalizedAddress.toLowerCase() !== recoveredAddress.toLowerCase()) {
            return res.status(401).json({ message: 'Invalid signature' });
        }

        // Generate new nonce for next login
        user.nonce = generateNonce();
        await user.save();

        // Generate JWT
        const token = jwt.sign(
            {
                walletAddress: normalizedAddress,
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
            },
            process.env.JWT_SECRET
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying signature' });
    }
});

app.post('/api/users/connect', async (req, res) => {
    try {
        const { address } = req.body;

        await User.findOneAndUpdate(
            { walletAddress: address },
            { walletAddress: address },
            { upsert: true }
        );

        res.status(200).json({ message: 'Wallet connected successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error connecting wallet' });
    }
});

app.get('/api/protected', verifyToken, async (req, res) => {
    res.json({ message: 'Access granted to protected route', user: req.user });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
