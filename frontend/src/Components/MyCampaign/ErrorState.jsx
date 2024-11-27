import { AlertCircle } from "lucide-react";

const ErrorState = ({ error }) => (
	<div className="min-h-screen bg-black flex items-center justify-center p-4">
		<div className="max-w-md bg-gray-900 rounded-xl p-8 border border-red-900">
			<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
			<h3 className="text-xl text-red-500 font-bold text-center mb-2">Error</h3>
			<p className="text-gray-400 text-center">{error}</p>
		</div>
	</div>
);

export default ErrorState;
