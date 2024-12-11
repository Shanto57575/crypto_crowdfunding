import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const Dashboard = () => {
	return (
		<div className="flex min-h-screen font-serif">
			<Sidebar />
			<main className="flex-1 md:ml-64 transition-all duration-300">
				<div className="p-4">
					<Outlet />
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
