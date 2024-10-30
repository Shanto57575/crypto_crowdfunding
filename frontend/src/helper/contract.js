import { ethers } from 'ethers';
import crowdFundingABI from '../utils/CrowdFunding.json';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export const getContract = async () => {
    try {
        if (!window.ethereum) return null;

        const provider = new ethers.BrowserProvider(window.ethereum);
        console.log("provider=>", provider)
        const signer = await provider.getSigner();
        console.log("signer=>", signer)
        const contract = new ethers.Contract(
            contractAddress,
            crowdFundingABI,
            signer
        );
        console.log("contract=>", contract)
        return contract;
    } catch (error) {
        console.error("Failed to load contract:", error);
        return null;
    }
}