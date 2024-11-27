import { Link } from "react-router-dom";
import { PlusCircle, ChevronRight } from "lucide-react";

const EmptyState = () => (
	<div className="min-h-screen bg-black flex items-center justify-center p-4">
		<div className="max-w-md bg-gray-900 rounded-xl p-8 border border-indigo-900/30">
			<div className="text-center space-y-6">
				<div className="relative w-24 h-24 mx-auto">
					<div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-pulse" />
					<PlusCircle className="w-24 h-24 text-indigo-500 relative z-10" />
				</div>
				<div>
					<h3 className="text-2xl font-bold text-white mb-2">
						No Campaigns Yet
					</h3>
					<p className="text-gray-400 mb-6">
						Start your fundraising journey today
					</p>
				</div>
				<Link to="/create-campaign">
					<button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2">
						Create Your First Campaign
						<ChevronRight className="w-5 h-5" />
					</button>
				</Link>
			</div>
		</div>
	</div>
);

export default EmptyState;
