import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../Pages/Home";
import CampaignList from "../Components/CampaignList";
import CreateCampaign from "../Components/CreateCampaign";

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
				path: "/all-campaigns",
				element: <CampaignList />,
			},
		],
	},
]);
