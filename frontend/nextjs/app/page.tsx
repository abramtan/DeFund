"use client";

import Link from "next/link";
import { Button } from "./components";
import ActiveCampaigns from "./components/ActiveCampaigns";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
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
                  <Link href="/create">
                    <Button className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50">
                      Start a Campaign
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <ActiveCampaigns />
        </div>
      </main>
    </div>
  );
};

export default Home;
