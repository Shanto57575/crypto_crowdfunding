import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../Pages/Home";
import CampaignList from "../Components/CampaignList";
import CreateCampaign from "../Components/CreateCampaign";
import PrivateRoutes from "./PrivateRoutes";
import MyCampaign from "../Components/MyCampaign";
import ViewDetails from "../Components/ViewDetails";
import UpdateCampaign from "../Components/UpdateCampaign";

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
				path: "/update-campaign",
				element: <UpdateCampaign />,
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
					{
						path: "/my-campaigns/view-details/:id",
						element: <ViewDetails />,
					},
				],
			},
		],
	},
]);
