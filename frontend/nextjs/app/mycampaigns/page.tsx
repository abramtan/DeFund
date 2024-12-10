"use client";
import MyCampaigns from "../components/MyCampaigns";
const CampaignsPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="bg-indigo-700 rounded-lg shadow-xl overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white sm:text-4xl">
                  My Campaigns
                </h1>
                <p className="mt-1 text-lg sm:text-xl text-indigo-200">
                  View the campaigns you have started.
                </p>
              </div>
            </div>
          </div>
          <MyCampaigns />
        </div>
      </main>
    </div>
  );
};

export default CampaignsPage;
