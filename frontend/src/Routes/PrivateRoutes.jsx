import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Loader from "../Components/Loader";

const PrivateRoutes = () => {
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true); // Start with loading true

	const fetchProtectedData = async () => {
		const token = localStorage.getItem("authToken");
		const userAddress = localStorage.getItem("userAddress");

		if (!token || !userAddress) {
			toast.error(<p className="font-serif">wallet is not connected !</p>);
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
				throw new Error("Failed to fetch protected data");
			}

			await response.json();
			setIsAuthenticated(true);
		} catch (error) {
			toast.error(<p className="font-serif">{error}</p>);
			navigate("/", { replace: true });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProtectedData();
	}, [navigate]);

	if (loading) {
		return <Loader sz={50} />;
	}

	return isAuthenticated ? <Outlet /> : null;
};

export default PrivateRoutes;
