import jwt from 'jsonwebtoken';
import { getAddress, verifyMessage } from 'ethers';
import User from '../models/user.model.js';

const generateRandomNumber = () => {
    return Math.floor(Math.random() * 1000000).toString();
};

const generateNonce = async (req, res) => {
    try {
        const { address } = req.body;
        const normalizedAddress = getAddress(address); // Updated for v6.13.4

        let user = await User.findOne({ walletAddress: normalizedAddress });
        const nonce = generateRandomNumber();

        if (!user) {
            user = new User({
                walletAddress: normalizedAddress,
                nonce
            });
        } else {
            user.nonce = nonce;
        }

        await user.save();
        res.json({ nonce });
    } catch (error) {
        res.status(500).json({ message: 'Error generating nonce' });
    }
}

const verifyUser = async (req, res) => {
    try {
        const { address, signature } = req.body;
        const normalizedAddress = getAddress(address);

        const user = await User.findOne({ walletAddress: normalizedAddress });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const message = `Sign here to verify your wallet: ${user.nonce}`;

        const recoveredAddress = verifyMessage(message, signature);

        if (normalizedAddress.toLowerCase() !== recoveredAddress.toLowerCase()) {
            return res.status(401).json({ message: 'Invalid signature' });
        }

        user.nonce = generateRandomNumber();
        await user.save();

        const token = jwt.sign(
            {
                walletAddress: normalizedAddress,
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
            },
            process.env.JWT_SECRET
        );
        // const token = jwt.sign(
        //     {
        //         walletAddress: normalizedAddress,
        //         exp: Math.floor(Date.now() / 1000) + 10
        //     },
        //     process.env.JWT_SECRET
        // );


        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying signature' });
    }
}

export {
    generateNonce,
    verifyUser
};
