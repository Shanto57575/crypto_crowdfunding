import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const FormattedBotMessage = ({ content }) => {
	console.log("content: ", content);

	if (!content) {
		return <p className="text-gray-300">No message content available.</p>;
	}

	const parseContent = () => {
		try {
			if (typeof content === "object") {
				return {
					mainAnswer: content.answer,
					exploreMore: content.suggestedQuestions,
					message: content.message,
				};
			}

			// If content is a string, handle the formatted string
			const contentString = String(content);

			// Handle error message
			if (contentString.includes("Sorry, I encountered an error")) {
				return {
					mainAnswer: contentString,
					exploreMore: [],
					message: "",
				};
			}

			// Split by separator
			const sections = contentString.split("━━━━━━━━━━━━━━━━━━━━━━");

			if (sections.length < 2) {
				return {
					mainAnswer: contentString,
					exploreMore: [],
					message: "",
				};
			}

			return {
				mainAnswer: sections[0].replace("Answer:", "").trim(),
				exploreMore: sections[1]
					?.replace("Explore More:", "")
					.trim()
					.split("\n")
					.filter((item) => item.trim()),
				message:
					sections[2]?.trim() ||
					"Have questions about FundChain or blockchain technology? I am here to help.",
			};
		} catch (error) {
			console.error("Error parsing content:", error);
			return {
				mainAnswer: "Sorry, I encountered an error processing the message.",
				exploreMore: [],
				message: "",
			};
		}
	};

	const { mainAnswer, exploreMore, message } = parseContent();

	return (
		<div className="space-y-3 w-full">
			{/* Main Answer */}
			<div>
				<span className="text-gray-400 text-sm">Answer:</span>
				<p className="text-gray-300 mt-1">{mainAnswer}</p>
			</div>

			{/* Explore More Section */}
			{exploreMore && exploreMore.length > 0 && (
				<>
					<div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
					<div>
						<span className="text-gray-400 text-sm">Explore More:</span>
						<div className="mt-2 space-y-1.5">
							{exploreMore.map((question, idx) => (
								<p
									key={idx}
									className="text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
								>
									• {question.replace("•", "").trim()}
								</p>
							))}
						</div>
					</div>

					<div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
					<p className="text-sm text-gray-400 italic">
						{message ||
							"Have questions about FundChain or blockchain technology? I am here to help."}
					</p>
				</>
			)}
		</div>
	);
};

const ChainChat = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([]);
	const [inputValue, setInputValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [suggestedQuestions, setSuggestedQuestions] = useState([]);
	const [showTooltip, setShowTooltip] = useState(false);
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	useEffect(() => {
		const fetchSuggestedQuestions = async () => {
			try {
				const response = await fetch(`${API_URL}/api/ai/suggested-questions`);
				const data = await response.json();
				if (data.success) {
					setSuggestedQuestions(data.data.beginner || []);
				}
			} catch (error) {
				console.error("Error fetching suggested questions:", error);
			}
		};

		fetchSuggestedQuestions();
	}, []);

	const handleSend = async (text = inputValue) => {
		if (!text.trim()) return;

		const newMessage = { type: "user", content: text };
		setMessages((prev) => [...prev, newMessage]);
		setInputValue("");
		setIsLoading(true);

		try {
			const response = await fetch(`${API_URL}/api/ai/ask`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question: text }),
			});

			const data = await response.json();

			if (data.success) {
				setMessages((prev) => [
					...prev,
					{
						type: "bot",
						content: data.data,
					},
				]);
			}
		} catch (error) {
			console.error("Error sending message:", error);
			setMessages((prev) => [
				...prev,
				{
					type: "bot",
					content: "Sorry, I encountered an error. Please try again later.",
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="fixed bottom-20 right-4 z-50 font-serif">
			{/* Chat Button with Tooltip */}
			{!isOpen && (
				<div className="relative">
					<button
						onClick={() => setIsOpen(true)}
						onMouseEnter={() => setShowTooltip(true)}
						onMouseLeave={() => setShowTooltip(false)}
						className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
					>
						<MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
					</button>
					{showTooltip && (
						<div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-md text-sm whitespace-nowrap">
							ChainChat
						</div>
					)}
				</div>
			)}

			{/* Chat Window */}
			{isOpen && (
				<div className="fixed inset-0 md:inset-auto md:absolute md:right-0 md:bottom-0 bg-gray-900 md:w-[400px] lg:w-[450px] md:h-[70vh] md:rounded-lg shadow-2xl flex flex-col border border-gray-700">
					{/* Header */}
					<div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg flex justify-between items-center">
						<div className="flex items-center gap-3">
							<div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
							<h3 className="font-bold text-white text-lg">ChainChat</h3>
						</div>
						<button
							onClick={() => setIsOpen(false)}
							className="text-white hover:bg-white/10 rounded-full p-1.5 transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Messages Area */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{messages.length === 0 && (
							<div className="space-y-4">
								<p className="text-gray-300">
									Hello! {"I'm"} your FundChain assistant. Ask me anything about
									blockchain and crowdfunding!
								</p>
								<div className="space-y-2">
									<p className="text-sm text-gray-400">Suggested questions:</p>
									{suggestedQuestions.map((question, index) => (
										<button
											key={index}
											className="w-full p-3 text-left text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors duration-200"
											onClick={() => handleSend(question)}
										>
											{question}
										</button>
									))}
								</div>
							</div>
						)}

						{messages.map((message, index) => (
							<div
								key={index}
								className={`flex ${
									message.type === "user" ? "justify-end" : "justify-start"
								} w-full`}
							>
								<div
									className={`max-w-[85%] p-3 rounded-lg ${
										message.type === "user"
											? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
											: "bg-gray-800"
									} shadow-lg`}
								>
									{message.type === "bot" ? (
										<FormattedBotMessage content={message.content} />
									) : (
										message.content
									)}
								</div>
							</div>
						))}

						{isLoading && (
							<div className="flex justify-start">
								<div className="bg-gray-800 p-3 rounded-lg flex gap-2">
									<div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
									<div
										className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
										style={{ animationDelay: "0.2s" }}
									></div>
									<div
										className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
										style={{ animationDelay: "0.4s" }}
									></div>
								</div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>

					{/* Input Area */}
					<div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-lg">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSend();
							}}
							className="flex gap-2"
						>
							<input
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								placeholder="Type your message..."
								className="flex-1 bg-gray-900 text-gray-300 placeholder-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
							/>
							<button
								type="submit"
								disabled={isLoading || !inputValue.trim()}
								className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg px-4 py-2 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
							>
								<Send className="w-5 h-5" />
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChainChat;
