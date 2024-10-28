import { useState } from "react";
import HashLoader from "react-spinners/HashLoader";

const override = {
	display: "block",
	margin: "0 auto",
	borderColor: "red",
};

function Loader() {
	return (
		<div className="sweet-loading">
			<HashLoader
				color={"#616569"}
				size={25}
				aria-label="Loading Spinner"
				data-testid="loader"
			/>
		</div>
	);
}

export default Loader;
