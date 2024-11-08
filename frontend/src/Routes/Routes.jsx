import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../Pages/Home";
import CampaignList from "../Components/CampaignList";
import CreateCampaign from "../Components/CreateCampaign";
import PrivateRoutes from "./PrivateRoutes";
import MyCampaign from "../Components/MyCampaign";
import ViewDetails from "../Components/ViewDetails";
import ErrorPage from "../Components/ErrorPage";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Main />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "/",
				element: <Home />,
			},
			{
				element: <PrivateRoutes />,
				children: [
					{
						path: "/create-campaign",
						element: <CreateCampaign />,
					},
					{
						path: "/my-campaigns",
						element: <MyCampaign />,
					},
					{
						path: "/all-campaigns",
						element: <CampaignList />,
					},
					{
						path: "/all-campaigns/view-details/:id",
						element: <ViewDetails />,
					},
				],
			},
		],
	},
]);
