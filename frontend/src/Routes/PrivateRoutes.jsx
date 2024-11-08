import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Loader from "../Components/Loader";
import { useWallet } from "../context/WalletContext";

const PrivateRoutes = () => {
	const { disconnect } = useWallet();
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	const fetchProtectedData = async () => {
		const token = localStorage.getItem("authToken");
		const userAddress = localStorage.getItem("userAddress");

		if (!token || !userAddress) {
			toast.error(<p className="font-serif">Wallet is not connected!</p>);
			setLoading(false);
			navigate("/", { replace: true });
			return;
		}

		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/protected`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				if (response.status === 401 || response.status === 403) {
					toast.error(
						<p className="font-serif text-center">
							Session expired. Please log in again.
						</p>
					);
					disconnect();
					navigate("/", { replace: true });
				} else {
					toast.error(
						<p className="font-serif text-center">
							Failed to fetch protected data.
						</p>
					);
				}
				setIsAuthenticated(false);
				return;
			}

			await response.json();
			setIsAuthenticated(true);
		} catch (error) {
			toast.error(
				<p className="font-serif">An error occurred: {error.message}</p>
			);
			setIsAuthenticated(false);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProtectedData();
	}, []);

	if (loading) {
		return <Loader sz={50} />;
	}

	return isAuthenticated ? <Outlet /> : null;
};

export default PrivateRoutes;
