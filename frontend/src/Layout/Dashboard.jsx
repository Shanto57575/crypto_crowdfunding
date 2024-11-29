import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const Dashboard = () => {
    return (
        <div className="flex font-serif">
      <div className="fixed">
        <Sidebar />
      </div>
      <div className="flex-1 ml-64 h-screen">
        <div className="p-4">
          {" "}
          <Outlet />
        </div>
      </div>
    </div>
    );
};

export default Dashboard;