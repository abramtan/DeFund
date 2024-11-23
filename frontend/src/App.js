import React, { useState } from "react";
import Web3 from 'web3';
import { Menu } from 'lucide-react'

const DeFundLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8 text-indigo-600"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
    <path d="M9 16l6-6" />
  </svg>
);

const Button = ({ children, variant, className, ...props }) => {
  let baseClasses = "px-4 py-2 rounded-lg font-medium transition";
  if (variant === "outline") {
    baseClasses += " border border-gray-300 text-gray-700 hover:bg-gray-100";
  } else if (variant === "ghost") {
    baseClasses += " bg-transparent text-gray-700 hover:bg-gray-100";
  } else {
    baseClasses += " ";
  }
  return (
    <button className={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Progress = ({ value, className }) => (
  <div className={`w-full bg-gray-200 rounded-full ${className}`}>
    <div
      className="bg-indigo-600 h-2 rounded-full"
      style={{ width: `${value}%` }}
    />
  </div>
);

const Card = ({ children, className, onClick }) => (
  <div
    className={`p-4 bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Dialog = ({ isOpen, onClose, children }) =>
  isOpen ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  ) : null;

const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(window.ethereum);
      return accounts[0];
    } catch (error) {
      console.error("User denied account access");
      return null;
    }
  } else {
    alert("Please install MetaMask!");
    return null;
  }
};

const Home = () => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [account, setAccount] = useState(null);

  const activeCampaigns = [
    {
      id: 1,
      title: "Medical Treatment Fund",
      goal: 5,
      raised: 3.2,
      daysLeft: 15,
      description: "Help fund a life-saving medical treatment for John Doe.",
    },
    {
      id: 2,
      title: "Tech Startup Boost",
      goal: 10,
      raised: 7.5,
      daysLeft: 7,
      description: "Support our innovative tech startup in launching a groundbreaking product.",
    },
    {
      id: 3,
      title: "Community Garden Project",
      goal: 2,
      raised: 0.8,
      daysLeft: 30,
      description: "Help us create a beautiful community garden in the heart of our city.",
    },
  ];

  const handleConnectWallet = async () => {
    const connectedAccount = await connectWallet();
    if (connectedAccount) {
      setAccount(connectedAccount);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <DeFundLogo />
              <span className="ml-2 text-2xl font-bold text-indigo-600">
                DeFund
              </span>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="/" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </a>
                <a href="/campaigns" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Campaigns
                </a>
                <a href="/create" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Create Campaign
                </a>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Button variant="outline" onClick={handleConnectWallet}>
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
              </Button>
            </div>
            <div className="flex items-center sm:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open main menu</span>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="bg-indigo-700 rounded-lg shadow-xl overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white sm:text-4xl">
                  Welcome to DeFund
                </h1>
                <p className="mt-1 text-lg sm:text-xl text-indigo-200">
                  Decentralized crowdfunding for a better future.
                </p>
                <div className="mt-8">
                  <Button className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50">
                    Start a Campaign
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Active Campaigns
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeCampaigns.map((campaign) => (
                <div key={campaign.id}>
                  <Card
                    onClick={() => {
                      setSelectedCampaign(campaign);
                    }}
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  >
                    <h3 className="font-semibold">{campaign.title}</h3>
                    <p className="text-sm text-gray-500">
                      Goal: {campaign.goal} ETH
                    </p>
                    <p className="text-sm text-gray-500">
                      Raised: {campaign.raised} ETH
                    </p>
                    <Progress
                      value={(campaign.raised / campaign.goal) * 100}
                      className="mt-2"
                    />
                    <span className="text-sm text-gray-500 mb-2 sm:mb-0">{campaign.daysLeft} days left</span>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            &copy; 2024 DeFund. All rights reserved.
          </p>
        </div>
      </footer>

      <Dialog
        isOpen={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      >
        {selectedCampaign && (
          <div>
            <h2 className="text-lg font-bold">{selectedCampaign.title}</h2>
            <p>{selectedCampaign.description}</p>
            <div className="mt-4">
              <Button onClick={() => setSelectedCampaign(null)}>Close</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Home;
