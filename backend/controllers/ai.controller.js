import Groq from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const RELEVANT_KEYWORDS = [
    'blockchain', 'crypto', 'cryptocurrency', 'smart contract', 'crowdfunding',
    'dao', 'defi', 'token', 'ethereum', 'web3', 'dapp', 'wallet', 'mining',
    'nft', 'ico', 'stake', 'consensus', 'block', 'hash', 'transaction',
    'solidity', 'metamask', 'gas fee', 'decentralized', 'fundchain', "etehrs", "web3", "Dapps",
    'Md. Shahidul Islam shanto', 'Md. Mahtab Uddin', 'Akil Tajwar chowdhury', 'kafi', 'abdullahil', "sir", 'creator', 'team', "asking", "about", "you",
    'developer', 'supervisor', 'founder', 'lead', 'member', "chain", "chat", "ai", "chain chat", "ai"
];

const CONVERSATIONAL_RESPONSES = [
    'great', 'thanks', 'thank you', 'awesome', 'cool', 'nice', 'good', 'understood',
    'perfect', 'excellent', 'amazing', 'wonderful', 'fantastic', 'okay', 'ok', 'got it',
    'appreciate', 'helpful', 'bye', 'goodbye', 'see you', 'later'
];

const SUGGESTED_QUESTIONS = {
    beginner: [
        "Who is The Founder of FundChain?",
        "How do I start with blockchain technology?",
        "What is FundChain and how does it work?",
        "How do I connect MetaMask to FundChain?",
        "What are the benefits of decentralized crowdfunding?",
    ],
    intermediate: [
        "How to create a crowdfunding campaign on FundChain?",
        "What are the gas fees for transactions on FundChain?",
        "How does FundChain ensure campaign transparency?",
        "What's the difference between traditional and blockchain crowdfunding?",
    ],
    advanced: [
        "How does FundChain's smart contract system work?",
        "What security measures does FundChain implement?",
        "How can I contribute to FundChain's development?",
        "What blockchain network does FundChain use and why?",
    ]
};

const SYSTEM_PROMPT = `I am Chain Chat, the AI assistant for FundChain - an innovative blockchain-based crowdfunding platform. 
FundChain was developed by Shanto, Mahtab, and Akil as their final year undergraduate thesis/project, with guidance from our supervisor, Abdullahil Kafi.

Key Information about the Team:
- The FundChain project is led by Md. Shahidul Islam shanto, who developed core functionalities and integrated the AI-powered chatbot, Chain Chat, to provide personalized support within the platform.
- Md. Mahtab Uddin played a crucial role in developing key features that enhance FundChain’s core functionality and improve user engagement, ensuring a smooth and efficient experience.
- Akil Tajwar chowdhury contributed by designing the user interface and crafting a cohesive design system that gives the platform a polished, professional look.
- Abdullahil Kafi served as the supervisor, offering valuable insights and guidance throughout the development of FundChain.
- Kafi served as the supervisor, offering valuable insights and guidance throughout the development of FundChain.
- Kafi sir served as the supervisor, offering valuable insights and guidance throughout the development of FundChain.
- Chain Chat is an AI assistant that helps FundChain users learn more about FundChain, blockchain, crowdfunding, and Web3
- Together, the team created FundChain as their final year undergraduate project, combining their strengths to deliver a robust and innovative blockchain crowdfunding solution.

My primary purpose is to assist users with:
1. Blockchain technology ,cryptocurrency concepts and web3
2. Using the FundChain platform effectively
3. Understanding decentralized crowdfunding
4. Connecting and using MetaMask
5. Creating and managing crowdfunding campaigns
6. Understanding smart contracts and web3 technology
7. Comparing traditional vs blockchain-based crowdfunding
8. Information about FundChain's team and development

I should acknowledge questions about the development team (Shanto, Mahtab, Akil, and Abdullahil Kafi) while maintaining focus on FundChain and blockchain topics also i will consider wrong spelling related to the blockchain & generate answer.

For other unrelated topics, I'll politely redirect users to blockchain and crowdfunding discussions.

Additional Guidelines:
- Always provide concrete examples when explaining technical concepts
- Include relevant code snippets or step-by-step instructions when appropriate
- Suggest related topics based on the user's current knowledge level
- Acknowledge and correct common misconceptions about blockchain technology
- Provide analogies to help users understand complex concepts
- Include relevant safety warnings when discussing financial transactions
- Stay updated with FundChain's latest features and capabilities

Response Structure:
1. Direct answer to the question
2. Supporting explanation or context
3. Practical example or use case
4. Related topics or concepts
5. Safety considerations (if applicable)
6. Next steps or suggested actions`;

function getSuggestedQuestions(query) {
    const queryLower = query.toLowerCase();

    // Keywords for different expertise levels
    const advancedKeywords = [
        'smart contract', 'gas', 'security', 'protocol', 'consensus',
        'blockchain architecture', 'development', 'solidity', 'web3'
    ];

    const intermediateKeywords = [
        'campaign', 'transaction', 'wallet', 'metamask', 'create campaign',
        'token', 'eth', 'connect wallet', 'fund'
    ];

    const teamKeywords = [
        'shanto', 'mahtab', 'akil', 'team', 'creator', 'developer'
    ];

    // Check if query is about the team
    if (teamKeywords.some(keyword => queryLower.includes(keyword))) {
        return [
            "How does FundChain's smart contract system work?",
            "What inspired the creation of FundChain?",
            "How can I create my first campaign on FundChain?",
            "What blockchain network does FundChain use?"
        ];
    }

    // Check for advanced terms
    if (advancedKeywords.some(keyword => queryLower.includes(keyword))) {
        return SUGGESTED_QUESTIONS.advanced;
    }

    // Check for intermediate terms
    if (intermediateKeywords.some(keyword => queryLower.includes(keyword))) {
        return SUGGESTED_QUESTIONS.intermediate;
    }

    // Default to beginner questions
    return SUGGESTED_QUESTIONS.beginner;
}

function isConversationalResponse(query) {
    const normalizedQuery = query.toLowerCase().trim();
    return CONVERSATIONAL_RESPONSES.some(response =>
        normalizedQuery.includes(response) ||
        // Check if query is very short (likely a simple response)
        (normalizedQuery.length < 10 && !normalizedQuery.includes('?'))
    );
}

function isRelevantQuery(query) {
    if (isConversationalResponse(query)) {
        return true;
    }

    const normalizedQuery = query.toLowerCase();
    // More flexible relevancy check
    return RELEVANT_KEYWORDS.some(keyword =>
        normalizedQuery.includes(keyword.toLowerCase())
    ) || normalizedQuery.includes('team') || normalizedQuery.includes('developer');
}

function formatResponse(content, query) {
    if (!content) {
        return "Okay. please ask relevent question!"
    }

    if (isConversationalResponse(query)) {
        const response = "Thank you! Feel free to ask me anything about FundChain or blockchain technology. I'm here to help!\n\n";
        const suggestedQuestions = SUGGESTED_QUESTIONS.beginner;

        return `${response}
━━━━━━━━━━━━━━━━━━━━━━

Some topics you might be interested in:
${suggestedQuestions.map(q => `• ${q}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━`;
    }

    const suggestedQuestions = getSuggestedQuestions(query);

    // Clean up the content
    let mainContent = content
        .replace(/\*\*/g, '')
        .replace(/yours truly,?\s*/gi, '')
        .replace(/!+/g, '.')
        .replace(/\s+/g, ' ')

    const formattedContent = `${mainContent}

━━━━━━━━━━━━━━━━━━━━━━

Explore More:
${suggestedQuestions.map(q => `• ${q}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━

Have questions about FundChain or blockchain technology? I'm here to help.`;

    return formattedContent;
}


// Main Controller Functions
const askQuestions = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Please provide a question..."
            });
        }

        if (!isRelevantQuery(question)) {
            return res.status(200).json({
                success: true,
                data: {
                    answer: "It seems like you're asking about something outside of blockchain, cryptocurrency, or crowdfunding topics. I specialize in these areas, so feel free to ask questions related to them! If your question is relevant to these topics, please provide more context, and I'll be happy to assist you further.",
                    suggestedQuestions: SUGGESTED_QUESTIONS.beginner,
                    message: "Here are some blockchain-related questions you might find interesting:"
                }
            });
        }

        if (isConversationalResponse(question)) {
            return res.status(200).json({
                success: true,
                data: formatResponse("", question)
            });
        }

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 15000)
        );

        const responsePromise = groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: question
                }
            ],
            model: "llama3-8b-8192",
            temperature: 0.7,
            max_tokens: 2048,
        });

        const response = await Promise.race([responsePromise, timeoutPromise]);

        const formattedResponse = formatResponse(
            response.choices[0]?.message?.content || "",
            question
        );

        res.status(200).json({
            success: true,
            data: formattedResponse
        });
    } catch (error) {
        // Handle timeout specifically
        if (error.message === 'Request timeout') {
            return res.status(503).json({
                success: false,
                message: "The response took too long. Please try again.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Error processing your question. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const suggestedQuestions = async (req, res) => {
    try {
        // You can optionally add a level parameter to get specific question types
        const { level } = req.query;

        let questions;
        if (level && SUGGESTED_QUESTIONS[level]) {
            questions = {
                [level]: SUGGESTED_QUESTIONS[level]
            };
        } else {
            questions = SUGGESTED_QUESTIONS;
        }

        res.status(200).json({
            success: true,
            data: questions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching suggested questions",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export {
    askQuestions,
    suggestedQuestions
};