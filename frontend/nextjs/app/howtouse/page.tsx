"use client";

const HowToUsePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="bg-indigo-700 rounded-lg shadow-xl overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white sm:text-4xl">
                  How to Use DeFund
                </h1>
                <p className="mt-1 text-lg sm:text-xl text-indigo-200">
                  A step-by-step guide to set up and use the app for
                  decentralized crowdfunding.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                1. Install MetaMask
              </h2>
              <p className="mt-2 text-gray-700">
                MetaMask is a chrome extension that allows you to interact with
                Ethereum-based applications. If you don&apos;t have it
                installed, visit{" "}
                <a
                  href="https://chromewebstore.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  chromewebstore.google.com
                </a>{" "}
                to search for &apos;metamask&apos; to download and set it up.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                2. Connect MetaMask to Sepolia Testnet
              </h2>
              <p className="mt-2 text-gray-700">
                To interact with DeFund, you need to use the Sepolia testnet.
                Follow these steps:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
                <li>Open MetaMask and click on your account icon.</li>
                <li>Select the networks button located in the top left.</li>
                <li>
                  Enable <strong>Show test networks</strong> and select{" "}
                  <strong>Sepolia</strong>.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                3. Get Sepolia Test ETH
              </h2>
              <p className="mt-2 text-gray-700">
                Since this is a testnet, you&apos;ll need test ETH to interact
                with the app. You can get some from a faucet like{" "}
                <a
                  href="https://sepoliafaucet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Sepolia Faucet
                </a>{" "}
                or{" "}
                <a
                  href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Google Cloud Web3 Faucet
                </a>
                . Enter your wallet address and follow the instructions to
                receive test ETH.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                4. Connect Your Wallet
              </h2>
              <p className="mt-2 text-gray-700">
                Click on the "Connect Wallet" button in the top-right corner of
                the DeFund app. MetaMask will prompt you to approve the
                connection.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                5. Explore Campaigns
              </h2>
              <p className="mt-2 text-gray-700">
                Browse existing campaigns or start your own. Navigate to the
                "Explore" page to view active and inactive campaigns or use the
                "Create Campaign" page to launch a new one.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                6. Donate to a Campaign
              </h2>
              <p className="mt-2 text-gray-700">
                Select a campaign and enter the amount of ETH you want to
                donate. Confirm the transaction in MetaMask. Once completed,
                your donation will be reflected in the campaign&apos;s details.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                7. Monitor Progress
              </h2>
              <p className="mt-2 text-gray-700">
                Check the progress of campaigns you&apos;ve donated to or
                created. Funds are released automatically if the funding goal is
                met.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">8. Need Help?</h2>
              <p className="mt-2 text-gray-700">
                If you encounter any issues, feel free to contact our support
                team or consult the FAQ section for common questions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HowToUsePage;
