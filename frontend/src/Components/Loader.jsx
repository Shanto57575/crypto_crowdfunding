import HashLoader from "react-spinners/HashLoader";

function Loader({ sz }) {
	return (
		<div className="sweet-loading h-screen flex justify-center items-center">
			<HashLoader
				color={"#fff"}
				size={200}
				aria-label="Loading Spinner"
				data-testid="loader"
			/>
		</div>
	);
}

export default Loader;
