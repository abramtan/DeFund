"use client";

import ActiveCampaigns from "../components/ActiveCampaigns";

const CampaignsPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Explore Active Campaigns
          </h1>
          <ActiveCampaigns />
        </div>
      </main>
    </div>
  );
};

export default CampaignsPage;
