"use client";

import { useState } from "react";
import { Button, Card, Dialog, Footer, Header, Progress } from "./components";

type Campaign = {
  id: number;
  title: string;
  goal: number;
  raised: number;
  daysLeft: number;
  description: string;
};

const Home = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

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
      description:
        "Support our innovative tech startup in launching a groundbreaking product.",
    },
    {
      id: 3,
      title: "Community Garden Project",
      goal: 2,
      raised: 0.8,
      daysLeft: 30,
      description:
        "Help us create a beautiful community garden in the heart of our city.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

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
                    onClick={() => setSelectedCampaign(campaign)}
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
                    <span className="text-sm text-gray-500">
                      {campaign.daysLeft} days left
                    </span>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <Dialog
        isOpen={!!selectedCampaign}
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
