import { createBrowserRouter } from "react-router-dom";
import CampaignList from "../Components/CampaignList";
import CreateCampaign from "../Components/CreateCampaign";
import ErrorPage from "../Components/ErrorPage";
import MyCampaign from "../Components/MyCampaign";
import MyDonation from "../Components/MyDonation";
import ViewDetails from "../Components/ViewDetails";
import Main from "../Layout/Main";
import Home from "../Pages/Home";
import PrivateRoutes from "./PrivateRoutes";
import Tutorial from "../Components/Tutorial";

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
        path: "/tutorial",
        element: <Tutorial />,
      },
      {
        path: "/my-donation",
        element: <MyDonation />,
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
            path: "/my-donations",
            element: <MyDonation />,
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
