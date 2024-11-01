// import { ethers } from "ethers";
// import toast from "react-hot-toast";
// import { createContext, useContext, useEffect, useState } from "react";

// const WalletContext = createContext();
// export const useWallet = () => useContext(WalletContext);

// export const WalletProvider = ({ children }) => {
// 	const [userAddress, setUserAddress] = useState(null);
// 	const [isConnecting, setIsConnecting] = useState(false); // Track connection status

// 	useEffect(() => {
// 		// Check for saved address in localStorage on mount
// 		const checkWalletConnection = async () => {
// 			const savedAddress = localStorage.getItem("userAddress");
// 			if (savedAddress) {
// 				setUserAddress(savedAddress);
// 			}
// 		};

// 		checkWalletConnection();

// 		// Listen for MetaMask account changes and disconnection
// 		if (window.ethereum) {
// 			window.ethereum.on("accountsChanged", handleAccountsChanged);
// 			window.ethereum.on("disconnect", handleDisconnect);
// 		}

// 		// Cleanup event listeners on unmount
// 		return () => {
// 			if (window.ethereum) {
// 				window.ethereum.removeListener(
// 					"accountsChanged",
// 					handleAccountsChanged
// 				);
// 				window.ethereum.removeListener("disconnect", handleDisconnect);
// 			}
// 		};
// 	}, []);

// 	// Handle account changes (e.g., if the user switches accounts in MetaMask)
// 	const handleAccountsChanged = (accounts) => {
// 		if (accounts.length === 0) {
// 			// User disconnected their wallet or MetaMask is locked
// 			localStorage.removeItem("userAddress");
// 			setUserAddress(null);
// 		} else {
// 			// Save the new address
// 			const address = accounts[0];
// 			setUserAddress(address);
// 			localStorage.setItem("userAddress", address);
// 		}
// 	};

// 	// Handle wallet disconnection
// 	const handleDisconnect = () => {
// 		localStorage.removeItem("userAddress");
// 		setUserAddress(null);
// 	};

// 	// Connect wallet with prevention of duplicate connection requests
// 	const connectWallet = async () => {
// 		if (!window.ethereum) {
// 			toast(
// 				<div className="font-serif text-center">
// 					<h1>MetaMask is not installed</h1>
// 					<p>
// 						Please Install MetaMask from{" "}
// 						<span className="text-blue-600 underline">https://metamask.io</span>
// 					</p>
// 				</div>
// 			);
// 			console.error("MetaMask is Not installed.");
// 			return;
// 		}

// 		if (isConnecting) return; // Prevent duplicate requests if already connecting

// 		try {
// 			setIsConnecting(true); // Set connecting state

// 			// Request accounts
// 			const accounts = await window.ethereum.request({
// 				method: "eth_accounts",
// 			});

// 			if (accounts.length === 0) {
// 				toast(
// 					<p className="font-serif text-center">
// 						Please unlock MetaMask by Clicking on its Icon in your Browser &
// 						Entering your password
// 					</p>
// 				);
// 				return;
// 			}

// 			await window.ethereum.request({ method: "eth_requestAccounts" });

// 			const provider = new ethers.BrowserProvider(window.ethereum);
// 			const signer = await provider.getSigner();
// 			const address = await signer.getAddress();

// 			setUserAddress(address);
// 			localStorage.setItem("userAddress", address);
// 		} catch (error) {
// 			if (error.code === -32002) {
// 				toast(
// 					<p className="font-serif text-center">
// 						A connection request is already pending. Please check MetaMask!
// 					</p>
// 				);
// 			} else {
// 				console.error("Connection error:", error.message);
// 			}
// 		} finally {
// 			setIsConnecting(false);
// 		}
// 	};

// 	return (
// 		<WalletContext.Provider
// 			value={{ userAddress, connectWallet, isConnecting }}
// 		>
// 			{children}
// 		</WalletContext.Provider>
// 	);
// };

import { ethers } from "ethers";
import toast from "react-hot-toast";
import { createContext, useContext, useEffect, useState } from "react";

const WalletContext = createContext();
export const useWallet = () => useContext(WalletContext);

const API_URL = "http://localhost:3001";

export const WalletProvider = ({ children }) => {
	const [userAddress, setUserAddress] = useState(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [token, setToken] = useState(localStorage.getItem("authToken"));

	useEffect(() => {
		const checkWalletConnection = async () => {
			const savedAddress = localStorage.getItem("userAddress");
			if (savedAddress) {
				setUserAddress(savedAddress);
				// Optionally reconnect authentication if token exists
				const savedToken = localStorage.getItem("authToken");
				if (savedToken) {
					setToken(savedToken);
				}
			}
		};

		checkWalletConnection();

		if (window.ethereum) {
			window.ethereum.on("accountsChanged", handleAccountsChanged);
			window.ethereum.on("disconnect", handleDisconnect);
		}

		return () => {
			if (window.ethereum) {
				window.ethereum.removeListener(
					"accountsChanged",
					handleAccountsChanged
				);
				window.ethereum.removeListener("disconnect", handleDisconnect);
			}
		};
	}, []);

	const handleAccountsChanged = (accounts) => {
		if (accounts.length === 0) {
			handleDisconnect();
		} else {
			const address = accounts[0];
			setUserAddress(address);
			localStorage.setItem("userAddress", address);
		}
	};

	const handleDisconnect = () => {
		localStorage.removeItem("userAddress");
		localStorage.removeItem("authToken");
		setUserAddress(null);
		setToken(null);
	};

	const authenticateWallet = async (address) => {
		try {
			// Get nonce from backend
			const nonceResponse = await fetch(`${API_URL}/api/auth/nonce`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ address }),
			});

			if (!nonceResponse.ok) {
				throw new Error("Failed to get nonce");
			}

			const { nonce } = await nonceResponse.json();

			// Create signature
			const message = `Sign this unique nonce to verify your wallet: ${nonce}`;
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();
			const signature = await signer.signMessage(message);

			// Verify signature with backend
			const verifyResponse = await fetch(`${API_URL}/api/auth/verify`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					address,
					signature,
				}),
			});

			if (!verifyResponse.ok) {
				throw new Error("Failed to verify signature");
			}

			const { token } = await verifyResponse.json();
			localStorage.setItem("authToken", token);
			setToken(token);

			toast.success("Wallet authenticated successfully!");
			return token;
		} catch (error) {
			console.error("Authentication error:", error);
			toast.error("Failed to authenticate wallet");
			throw error;
		}
	};

	const connectWallet = async () => {
		if (!window.ethereum) {
			toast(
				<div className="font-serif text-center">
					<h1>MetaMask is not installed</h1>
					<p>
						Please Install MetaMask from{" "}
						<span className="text-blue-600 underline">https://metamask.io</span>
					</p>
				</div>
			);
			console.error("MetaMask is Not installed.");
			return;
		}

		if (isConnecting) return;

		try {
			setIsConnecting(true);

			const accounts = await window.ethereum.request({
				method: "eth_accounts",
			});

			if (accounts.length === 0) {
				toast(
					<p className="font-serif text-center">
						Please unlock MetaMask by Clicking on its Icon in your Browser &
						Entering your password
					</p>
				);
				return;
			}

			await window.ethereum.request({ method: "eth_requestAccounts" });

			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();
			const address = await signer.getAddress();

			setUserAddress(address);
			localStorage.setItem("userAddress", address);

			// After connecting wallet, authenticate with backend
			await authenticateWallet(address);
		} catch (error) {
			if (error.code === -32002) {
				toast(
					<p className="font-serif text-center">
						A connection request is already pending. Please check MetaMask!
					</p>
				);
			} else {
				console.error("Connection error:", error.message);
			}
		} finally {
			setIsConnecting(false);
		}
	};

	return (
		<WalletContext.Provider
			value={{
				userAddress,
				connectWallet,
				isConnecting,
				token,
				isAuthenticated: !!token,
				disconnect: handleDisconnect,
			}}
		>
			{children}
		</WalletContext.Provider>
	);
};
