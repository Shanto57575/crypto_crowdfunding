import "./index.css";
import { router } from "./Routes/Routes";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
	<WalletProvider>
		<RouterProvider router={router} />
		<Toaster />
	</WalletProvider>
);
