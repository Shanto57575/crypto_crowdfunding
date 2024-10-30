import HashLoader from "react-spinners/HashLoader";

function Loader({ sz }) {
	return (
		<div className="sweet-loading">
			<HashLoader
				color={"#616569"}
				size={sz}
				aria-label="Loading Spinner"
				data-testid="loader"
			/>
		</div>
	);
}

export default Loader;
