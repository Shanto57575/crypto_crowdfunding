const Tutorial = () => {
    // Array of tutorial steps
    const steps = [
        {
            title: "Step 1: Installing the Metamask Extension",
            image: "1.png",
            description: "Begin by visiting the Chrome Web Store and searching for the Metamask Extension. Click on the 'Add to Chrome' button to install it. Metamask is a crucial tool for managing your cryptocurrency wallets and interacting with blockchain applications. After the installation is complete, you will notice the Metamask icon in your browser's toolbar."
        },
        {
            title: "Step 2: Setting Up Your Wallet",
            image: "2.png",
            description: "Click on the Metamask icon in the toolbar to open it. You will be greeted with an introduction screen. Check the box to accept the terms and conditions, then click the 'Create a New Wallet' button. This initiates the wallet setup process where you'll configure your new wallet."
        },
        {
            title: "Step 3: Agreeing to Policies",
            image: "3.png",
            description: "To proceed, you need to agree to Metamask's policies. Carefully read through the privacy and security terms. Tick the checkbox to acknowledge your agreement and click the 'I Agree' button to move forward. This step ensures that you understand how Metamask manages your data."
        },
        {
            title: "Step 4: Creating a Strong Password",
            image: "4.png",
            description: "Create a password that is at least 8 characters long and includes a mix of uppercase letters, numbers, and symbols. This password will be used to secure your wallet on your local device. Remember to store your password securely as it cannot be recovered if lost. After entering the password twice, tick the checkbox to confirm, and click the 'Create a New Wallet' button."
        },
        {
            title: "Step 5: Securing Your Wallet",
            image: "5.png",
            description: "To enhance security, Metamask will prompt you to secure your wallet with a recovery option. Click on the 'Secure My Wallet' button to proceed. This step is essential to safeguard your wallet in case you lose access to your browser or device."
        },
        {
            title: "Step 6: Revealing the Secret Recovery Phrase",
            image: "6.png",
            description: "You will be presented with a secret recovery phrase, hidden initially for security. Click the 'Reveal Secret Recovery Phrase' button to view it. This phrase is critical for recovering your wallet if you lose access to your password or device. Never share this phrase with anyone and store it in a secure location."
        },
        {
            title: "Step 7: Saving Your Recovery Phrase",
            image: "7.png",
            description: "Write down your recovery phrase on paper or save it in a highly secure digital format. Avoid storing it in easily accessible locations like text files or screenshots on your device. Metamask will ask you to verify this phrase in the next step to confirm you've saved it correctly."
        },
        {
            title: "Step 8: Verifying Your Recovery Phrase",
            image: "8.png",
            description: "Metamask will ask you to re-enter certain words from your recovery phrase. This ensures that you've saved it properly. Follow the prompts and select the correct words in the right order to complete the verification process. This step is mandatory to secure your wallet."
        },
        {
            title: "Step 9: Completion Confirmation",
            image: "9.png",
            description: "Once all steps are completed successfully, you will see a 'Congratulations' page. This indicates that your wallet setup is complete. Click the 'Done' button to finish the process and access your wallet's main dashboard."
        },
        {
            title: "Step 10: Navigating to the Next Step",
            image: "10.png",
            description: "Click the 'Next' button on the dashboard to explore additional configuration settings. This helps you familiarize yourself with Metamask's features and options for managing your wallet."
        },
        {
            title: "Step 11: Successful Installation",
            image: "11.png",
            description: "Congratulations! Metamask has been installed successfully, and your wallet is ready to use. You can now start interacting with blockchain applications and managing cryptocurrencies securely."
        },
        {
            title: "Step 12: Verifying the Wallet Screen",
            image: "12.png",
            description: "If you've followed all the steps correctly, you will see a wallet interface displaying your account details. Click the three-dot icon for additional settings, such as managing networks or connecting accounts."
        },
        {
            title: "Step 13: Exploring Wallet Options",
            image: "13.png",
            description: "Clicking the three-dot icon reveals a menu with several options. By default, the 'Ethereum Mainnet' network will be selected. This is the primary blockchain network supported by Metamask for live transactions."
        },
        {
            title: "Step 14: Enabling Test Networks",
            image: "14.png",
            description: "Scroll through the settings to find the toggle button labeled 'Show Test Networks.' Enable this option to access test networks like 'Sepolia.' These networks allow you to test blockchain interactions without using real cryptocurrency."
        },
        {
            title: "Step 15: Viewing the Wallet Popup",
            image: "15.png",
            description: "Open the Metamask extension. A popup will appear showing your wallet's status. If no accounts are connected, you will need to connect one manually to interact with blockchain applications."
        },
        {
            title: "Step 16: Viewing Your Wallet Address",
            image: "16.png",
            description: "Even if no accounts are connected, Metamask displays your wallet address. This address is unique to your wallet and is used to send or receive cryptocurrency securely."
        },
        {
            title: "Step 17: Connecting the Wallet to a Website",
            image: "17.png",
            description: "Click the 'Connect Wallet' button on the website you want to interact with. This will initiate a connection request to your Metamask wallet, allowing the website to access your wallet for transactions."
        },
        {
            title: "Step 18: Authorizing the Connection",
            image: "18.png",
            description: "Metamask will prompt you to authorize the connection. Review the details of the request and click 'Confirm' to establish a secure link between the website and your wallet."
        },
        {
            title: "Step 19: Signing a Request",
            image: "19.png",
            description: "You may receive a 'Signature Request' popup from Metamask. This is typically required to authorize specific actions or transactions. Carefully review the details and click 'Confirm' to proceed."
        },
        {
            title: "Step 20: Wallet Connection Confirmation",
            image: "22.png",
            description: "Once the connection is established, you will see a message confirming that your wallet has been connected successfully. This allows you to interact with the website seamlessly."
        },
        {
            title: "Step 21: Disconnecting the Wallet",
            image: "21.png",
            description: "If you want to disconnect your wallet, click on the logout icon in the website or Metamask interface. This will safely disconnect your wallet and prevent further interactions."
        }
    ];
    
    return (
        <div className="w-3/4 mx-auto pt-32 pb-24">
            <h3 className="text-center text-4xl">Tutorial For Beginners</h3>
            <p className="text-gray-300 text-center pt-3">
                If you are a complete beginner in blockchain, this is a step-by-step documentation to get you started with blockchain.
            </p>
            <div>
                {steps.map((step, index) => (
                    <div key={index} className="pt-10">
                        <h4 className="text-5xl">{step.title}</h4>
                        <img className="w-1/2 mx-auto mt-5" src={step.image} alt={`Step ${index + 1}`} />
                        <p className="text-gray-300 pt-3">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tutorial;
