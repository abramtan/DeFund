"use client";

import { useEffect, useState } from "react";
import CreateCampaign from "../components/CreateCampaign";
import { getAccount } from "../web3/utils";

const CreateCampaignPage = () => {
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check whether user has connected their Metamask
      if (getAccount()) setAccount(getAccount());
    } catch (error) {}
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="bg-indigo-700 rounded-lg shadow-xl overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white sm:text-4xl">
                  Start a New Campaign
                </h1>
                <p className="mt-1 text-lg sm:text-xl text-indigo-200">
                  Share your story and raise funds for your cause.
                </p>
              </div>
            </div>
          </div>
          {account ? (
            <CreateCampaign />
          ) : (
            <div className="text-center py-10">
              <h2 className="text-2xl font-semibold text-gray-800">
                Wallet Not Connected
              </h2>
              <p className="mt-2 text-gray-600">
                Opps, looks like your Metamask wallet isn't connected. Please
                connect now by clicking on the "Connect Wallet" button on the
                top right of this page, and refresh!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateCampaignPage;
