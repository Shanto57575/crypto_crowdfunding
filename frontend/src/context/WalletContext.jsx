import toast from "react-hot-toast";
import { createContext, useContext, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { jwtDecode } from "jwt-decode";

const WalletContext = createContext();
export const useWallet = () => useContext(WalletContext);

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const WalletProvider = ({ children }) => {
	const [userAddress, setUserAddress] = useState(null);
	const [isConnecting, setIsConnecting] = useState(false);
	const [token, setToken] = useState(localStorage.getItem("authToken"));

	useEffect(() => {
		const checkWalletConnection = async () => {
			const savedAddress = localStorage.getItem("userAddress");
			if (savedAddress) {
				setUserAddress(savedAddress);
				const savedToken = localStorage.getItem("authToken");
				if (savedToken) {
					// Check if the token is expired
					const decodedToken = jwtDecode(savedToken);
					const isExpired = Date.now() >= decodedToken.exp * 1000;

					if (isExpired) {
						// Token expired, remove address and token
						localStorage.removeItem("userAddress");
						localStorage.removeItem("authToken");
						setUserAddress(null);
						setToken(null);
						toast.error(
							<h1 className="font-serif text-center">
								Your session has expired, please reconnect
							</h1>
						);
					} else {
						setToken(savedToken);
					}
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

			// Ensure token exists, otherwise authenticate
			if (!token || localStorage.getItem("authToken") === null) {
				authenticateWallet(address)
					.then((newToken) => {
						if (newToken) {
							setToken(newToken);
							localStorage.setItem("authToken", newToken);
						}
					})
					.catch((error) => {
						console.error("Authentication error on account change:", error);
					});
			}
		}
	};

	const handleDisconnect = () => {
		localStorage.removeItem("userAddress");
		localStorage.removeItem("authToken");
		toast.success(<h1 className="font-serif">User disconnected</h1>);
		setUserAddress(null);
		setToken(null);
	};

	const authenticateWallet = async (address) => {
		try {
			const nonceResponse = await fetch(`${API_URL}/api/auth/nonce`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ address }),
			});

			if (!nonceResponse.ok) {
				console.error("Nonce fetch failed:", nonceResponse);
				throw new Error("Failed to get nonce");
			}

			const { nonce } = await nonceResponse.json();

			// Create signature
			const message = `Sign here to verify your wallet: ${nonce}`;
			const provider = new BrowserProvider(window.ethereum);
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
				console.error("Signature verification failed:", verifyResponse);
				throw new Error("Failed to verify signature");
			}

			const { token } = await verifyResponse.json();
			if (token) {
				localStorage.setItem("authToken", token);
				setToken(token);
				toast.success(
					<h1 className="font-serif">Wallet connected successfully!</h1>
				);
				return token;
			} else {
				console.error("Token was not returned:", token);
				return null;
			}
		} catch (error) {
			console.error("Authentication error:", error);
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
						Please unlock MetaMask by Clicking on its Icon in your Browser &amp;
						Entering your password
					</p>
				);
				return;
			}

			await window.ethereum.request({ method: "eth_requestAccounts" });

			const provider = new BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();
			const address = await signer.getAddress();

			// Authenticate and get the token
			const token = await authenticateWallet(address);
			console.log("token==>", token);
			if (token) {
				setUserAddress(address);
				setToken(token); // Set token in state
				localStorage.setItem("userAddress", address);
				localStorage.setItem("authToken", token); // Save token to localStorage
			}
		} catch (error) {
			if (error.code === -32002) {
				toast(
					<p className="font-serif text-center">
						A connection request is already pending. Please check MetaMask!
					</p>
				);
			} else {
				console.error("Connection error:", error.message);
				toast.error(
					<h1 className="font-serif">{error.message.slice(0, 20)}</h1>
				);
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
