"use client";

import { useState } from "react";
import { Header, Footer, Card, Progress, Dialog, Button } from "../components";

type Campaign = {
  id: number;
  title: string;
  goal: number;
  raised: number;
  daysLeft: number;
  description: string;
};

const CampaignsPage = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  const campaigns = [
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Explore Campaigns
          </h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <Card
                key={campaign.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => setSelectedCampaign(campaign)}
              >
                <h2 className="font-semibold text-lg">{campaign.title}</h2>
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
            ))}
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
            <p className="mt-4">{selectedCampaign.description}</p>
            <div className="mt-6">
              <Button onClick={() => setSelectedCampaign(null)}>Close</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default CampaignsPage;
