import { useState } from "react";
import MyCampaignCard from "./MyCampaignCard";

const MyCampaignList = ({
	campaigns,
	onUpdate,
	onWithdraw,
	onUpdateSuccess,
}) => {
	const [loadingStates, setLoadingStates] = useState({
		delete: {},
		update: {},
		claim: {},
		withdraw: {},
	});

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
			{campaigns.map((campaign) => (
				<MyCampaignCard
					key={campaign.id}
					campaign={campaign}
					loadingStates={loadingStates}
					setLoadingStates={setLoadingStates}
					onUpdate={onUpdate}
					onWithdraw={onWithdraw}
					onUpdateSuccess={onUpdateSuccess}
				/>
			))}
		</div>
	);
};

export default MyCampaignList;
