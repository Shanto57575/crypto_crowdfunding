import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

const PrivateRoutes = () => {
	const navigate = useNavigate();
	const [isAuthenticated, setIsAuthenticated] = useState(null);

	useEffect(() => {
		const user = localStorage.getItem("userAddress");

		if (!user) {
			toast.error(<p className="font-serif">please connect Metamsk</p>);
			navigate("/", { replace: true });
		} else {
			setIsAuthenticated(true);
		}
	}, [navigate]);

	return isAuthenticated ? <Outlet /> : null;
};

export default PrivateRoutes;
