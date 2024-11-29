import { createBrowserRouter } from "react-router-dom";
import CreateCampaign from "../Components/CreateCampaign";
import ErrorPage from "../Components/ErrorPage";
import MyDonation from "../Components/MyDonation";
import ViewDetails from "../Components/ViewDetails";
import Main from "../Layout/Main";
import Home from "../Pages/Home";
import PrivateRoutes from "./PrivateRoutes";
import Tutorial from "../Components/Tutorial";
import Blog from "../Components/Blog";
import { CampaignList } from "../Components/CampaignList/CampaignList";
import MyCampaign from "../Components/MyCampaign/MyCampaign";
import DashboardHome from "../Components/Dashboard/DashboardHome";
import Dashboard from "../Layout/Dashboard";

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
				path: "/blog",
				element: <Blog />,
			},
			{
				path: "/user-guide",
				element: <Tutorial />,
			},
			{
				element: <PrivateRoutes />,
				children: [
					{
						path: "/all-campaigns/view-details/:id",
						element: <ViewDetails />,
					},
					{
						path: "/all-campaigns",
						element: <CampaignList />,
					},
				]
			}
		],
	},
	{
		element: <PrivateRoutes />,
		children: [
			{
				path: "/dashboard",
				element: <Dashboard />,
				errorElement: <ErrorPage />,
				children: [
					{
						path: "/dashboard/dashboardHome",
						element: <DashboardHome />,
					},
					{
						path: "/dashboard/create-campaign",
						element: <CreateCampaign />,
					},
					{
						path: "/dashboard/my-campaigns",
						element: <MyCampaign />,
					},
					{
						path: "/dashboard/my-donations",
						element: <MyDonation />,
					},
				],
			}
		]
	},
]);
