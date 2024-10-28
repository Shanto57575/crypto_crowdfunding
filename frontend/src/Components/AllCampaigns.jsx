import { useEffect, useState } from "react";
import axios from "axios";

const AllCampaigns = () => {
	const [metaData, setMetaData] = useState({});
	console.log(metaData);

	const fetchCampaigns = async () => {
		const res = await axios.get(
			"https://fuchsia-broad-asp-870.mypinata.cloud/ipfs/bafkreigiodkjs5vpujvxcwzkvd7bdfrvhurzhrahwum4gcxhn6k2sojtgq"
		);
		console.log(res);
		setMetaData(res.data);
	};

	useEffect(() => {
		fetchCampaigns();
	}, []);

	return (
		<div className="text-white min-h-screen pt-32 text-center">
			<h1 className="text-3xl mb-5">Show All Campaigns</h1>
			<div className="flex items-center justify-between max-w-5xl mx-auto">
				<img className="h-96" src={metaData.image} alt="" />
				<div className="text-xl uppercase">
					<p className="text-purple-400">{metaData.title}</p>
					<p>{metaData.description}</p>
				</div>
			</div>
		</div>
	);
};

export default AllCampaigns;
