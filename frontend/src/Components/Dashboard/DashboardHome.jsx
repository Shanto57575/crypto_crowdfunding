const DashboardHome = () => {
	const campaigns = [
		{ id: 1, name: "Tech Innovators Fund", raised: 12500, goal: 20000 },
		{ id: 2, name: "Green Energy Project", raised: 8700, goal: 15000 },
		{ id: 3, name: "Community Art Initiative", raised: 3200, goal: 5000 },
	];

	const recentDonations = [
		{ id: 1, name: "Anonymous", amount: 150, campaign: "Tech Innovators Fund" },
		{ id: 2, name: "Sarah L.", amount: 75, campaign: "Green Energy Project" },
		{
			id: 3,
			name: "Michael R.",
			amount: 200,
			campaign: "Community Art Initiative",
		},
		{ id: 4, name: "Emma T.", amount: 50, campaign: "Tech Innovators Fund" },
	];

	return (
		<div className="min-h-screen bg-gray-900 text-white p-6">
			<header className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Dashboard</h1>
			</header>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<div className="bg-gray-800 p-6 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">Total Raised</h3>
					<p className="text-3xl font-bold">$45,231.89</p>
				</div>
				<div className="bg-gray-800 p-6 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">Active Campaigns</h3>
					<p className="text-3xl font-bold">12</p>
				</div>
				<div className="bg-gray-800 p-6 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">Total Backers</h3>
					<p className="text-3xl font-bold">1,234</p>
				</div>
				<div className="bg-gray-800 p-6 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">Avg. Donation</h3>
					<p className="text-3xl font-bold">$32.50</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="bg-gray-800 p-6 rounded-lg">
					<h2 className="text-xl font-bold mb-4">Your Active Campaigns</h2>
					<div className="space-y-4">
						{campaigns.map((campaign) => (
							<div key={campaign.id} className="space-y-2">
								<div className="flex justify-between items-center">
									<span className="font-medium">{campaign.name}</span>
									<span className="text-sm text-gray-400">
										${campaign.raised} / ${campaign.goal}
									</span>
								</div>
								<div className="bg-gray-700 h-2 rounded-full overflow-hidden">
									<div
										className="bg-purple-600 h-full rounded-full"
										style={{
											width: `${(campaign.raised / campaign.goal) * 100}%`,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="bg-gray-800 p-6 rounded-lg">
					<h2 className="text-xl font-bold mb-4">Recent Donations</h2>
					<div className="space-y-4">
						{recentDonations.map((donation) => (
							<div
								key={donation.id}
								className="flex justify-between items-center"
							>
								<div>
									<p className="font-medium">{donation.name}</p>
									<p className="text-sm text-gray-400">{donation.campaign}</p>
								</div>
								<span className="font-bold text-green-400">
									${donation.amount}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardHome;
