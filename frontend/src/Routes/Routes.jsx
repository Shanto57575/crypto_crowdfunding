import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../Pages/Home";
import CampaignList from "../Components/CampaignList";
import CreateCampaign from "../Components/CreateCampaign";
import PrivateRoutes from "./PrivateRoutes";
import MyCampaign from "../Components/MyCampaign";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Main />,
		children: [
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "/create-campaign",
				element: <CreateCampaign />,
			},
			{
				element: <PrivateRoutes />,
				children: [
					{
						path: "/my-campaigns",
						element: <MyCampaign />,
					},
					{
						path: "/all-campaigns",
						element: <CampaignList />,
					},
				],
			},
		],
	},
]);