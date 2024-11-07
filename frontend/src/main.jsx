import "./index.css";
import { router } from "./Routes/Routes";
import { Toaster } from "react-hot-toast";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";

createRoot(document.getElementById("root")).render(
	<WalletProvider>
		<RouterProvider router={router} />
		<Toaster />
	</WalletProvider>
);
