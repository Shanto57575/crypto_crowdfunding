import { Home, Frown } from "lucide-react";
import { Link } from "react-router-dom";

const ErrorPage = () => {
	return (
		<div className="min-h-screen font-serif bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
			{/* Gradient Background Effect */}
			<div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20" />

			{/* Decorative Circle */}
			<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
			<div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

			<div className="text-center space-y-8 max-w-lg relative z-10">
				{/* Glitch Effect Error Text */}
				<div className="relative">
					<h1 className="text-[120px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 leading-none">
						404
					</h1>
				</div>

				{/* Error Icon */}
				<div className="flex justify-center">
					<Frown className="h-20 w-20 text-blue-400 animate-pulse" />
				</div>

				{/* Error Message */}
				<div className="space-y-4">
					<h2 className="text-2xl font-bold text-white">Page Not Found</h2>
					<p className="text-gray-400 text-lg">
						The digital void has consumed this page. Lets get you back to
						safety.
					</p>
				</div>

				{/* Home Button */}
				<Link
					to="/"
					className="inline-flex items-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-200 gap-2 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
				>
					<Home className="h-5 w-5" />
					Return to Home
				</Link>

				{/* Additional Info */}
				<div className="pt-8">
					<p className="text-sm text-gray-500">
						Error Code: 404 | Lost in the Digital Void
					</p>
				</div>
			</div>

			{/* Animated Grid Background */}
			<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)] pointer-events-none" />
		</div>
	);
};

export default ErrorPage;
