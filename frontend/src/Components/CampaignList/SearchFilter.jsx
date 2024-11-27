import { useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";

export function SearchFilter({ filter, searchTerm, onFilterChange, onSearch }) {
	const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
	const [showSearch, setShowSearch] = useState(true);

	const handleSearch = () => {
		onSearch(localSearchTerm);
		setShowSearch(false);
	};

	const clearSearch = () => {
		setLocalSearchTerm("");
		onSearch("");
		setShowSearch(true);
	};

	return (
		<div className="max-w-4xl mx-auto px-2 mb-10">
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative min-w-[140px] sm:min-w-[180px]">
					<select
						value={filter}
						onChange={(e) => {
							console.log("onChange triggered with value:", e.target.value); // Debug here
							onFilterChange(e.target.value);
						}}
						className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-800 border border-gray-700 rounded-xl sm:rounded-2xl text-gray-100 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm sm:text-base"
					>
						<option value="All Campaigns">All Campaigns</option>
						<option value="Medical Treatment">Medical Treatment</option>
						<option value="Disaster Relief">Disaster Relief</option>
						<option value="Education">Education</option>
						<option value="Startup Business">Startup Business</option>
						<option value="Creative Projects">Creative Projects</option>
						<option value="Community Service">Community Service</option>
						<option value="Technology">Technology</option>
						<option value="Environmental">Environmental</option>
					</select>
					<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
				</div>
				<div className="flex-1 relative">
					{showSearch ? (
						<div className="flex items-center gap-2">
							<input
								type="text"
								value={localSearchTerm}
								onChange={(e) => setLocalSearchTerm(e.target.value)}
								placeholder="Search campaigns..."
								className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-800 border border-gray-700 rounded-xl sm:rounded-2xl pr-24 sm:pr-32 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm sm:text-base"
							/>
							<button
								onClick={handleSearch}
								disabled={!localSearchTerm}
								className="absolute right-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
							>
								<Search className="w-3 h-3 sm:w-4 sm:h-4" />
								<span className="hidden sm:inline">Search</span>
							</button>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<div className="flex-1 px-3 sm:px-4 py-3 sm:py-4 bg-gray-800 border border-gray-700 rounded-xl sm:rounded-2xl text-gray-100 text-sm sm:text-base">
								<span className="flex items-center gap-2">
									<Search className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
									<span className="truncate">
										Results for: {localSearchTerm}
									</span>
								</span>
							</div>
							<button
								onClick={clearSearch}
								className="px-3 sm:px-4 py-3 sm:py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl sm:rounded-2xl transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
							>
								<X className="w-3 h-3 sm:w-4 sm:h-4" />
								<span className="hidden sm:inline">Clear</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
