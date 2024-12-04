import { Loader2 } from "lucide-react";

const LoadingState = () => (
	<div className="min-h-screen flex justify-center items-center">
		<div className="text-center space-y-4">
			<Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto" />
			<p className="text-indigo-400 animate-pulse font-medium">
				Loading campaigns...
			</p>
		</div>
	</div>
);

export default LoadingState;
