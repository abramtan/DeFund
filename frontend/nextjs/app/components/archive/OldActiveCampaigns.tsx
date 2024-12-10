import { Campaign } from "@/app/web3/campaign";
import {
  getActiveDeployedCampaigns,
  finalizeCampaign,
  getMyCampaigns,
} from "@/app/web3/functions";
import { useEffect, useState } from "react";
import { convertWeiToEth } from "../../web3/utils";
import Link from "next/link";
import Card from "../Card";
import DonateCampaignDialog from "../DonateCampaignDialog";
import FinalizeCampaignDialog from "../FinalizeCampaignDialogue";
import Progress from "../Progress";

const ActiveCampaigns = ({
  activeCampaigns,
  fetchActiveCampaigns,
}: {
  activeCampaigns: Campaign[];
  fetchActiveCampaigns: () => Promise<void>;
}) => {
  const [donateCampaign, setDonateCampaign] = useState<Campaign | null>(null);
  const [myCampaignAddresses, setMyCampaignAddresses] = useState<Set<string>>(
    new Set(),
  );
  const [campaignToFinalize, setCampaignToFinalize] = useState<Campaign | null>(
    null,
  );
  // Helper function to calculate days left
  const getNumOfDaysLeft = (timestamp: number): number => {
    const today = new Date();
    const todayTimestamp = today.setHours(0, 0, 0, 0) / 1000;
    const differenceInSeconds = Math.abs(timestamp - todayTimestamp);
    const differenceInDays = Math.floor(differenceInSeconds / (60 * 60 * 24));
    return differenceInDays;
  };

  // Refresh campaigns after donation
  const handleDonationSuccess = async () => {
    await fetchActiveCampaigns();
  };

  // Utility function to check if the deadline has passed
  const isDeadlinePassed = (deadline: number): boolean => {
    return Date.now() >= deadline;
  };

  // Fetch campaigns belonging to user
  useEffect(() => {
    const fetchMyCampaigns = async () => {
      try {
        // Fetch campaigns owned by the user
        const myCampaigns = await getMyCampaigns();

        // Create a Set of campaign addresses owned by the user
        const myCampaignAddresses = new Set(myCampaigns.map((c) => c.address));

        setMyCampaignAddresses(myCampaignAddresses); // Save ownership info
      } catch (error) {
        console.error("Error fetching my campaigns:", error);
      }
    };

    fetchMyCampaigns();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {activeCampaigns.length === 0 ? (
            // Display empty state message when there are no active campaigns
            <div className="text-center py-10">
              <h2 className="text-2xl font-semibold text-gray-800">
                No Active Campaigns
              </h2>
              <p className="mt-2 text-gray-600">
                It looks like there are no active campaigns right now. Be the
                first to start one!
              </p>
              <div className="mt-6">
                <Link href="/create">
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    Start a Campaign
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            // Render active campaigns
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeCampaigns.map(
                (campaign) =>
                  campaign && ( // Validate the campaign object
                    <Card
                      key={campaign.address}
                      className="p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                      onClick={() => setDonateCampaign(campaign)}
                    >
                      <h2 className="font-semibold text-lg text-gray-800 mb-2">
                        {campaign.name}
                      </h2>
                      <p className="text-sm text-gray-500 mb-1">
                        <span className="font-semibold text-gray-700">
                          Goal:
                        </span>{" "}
                        {convertWeiToEth(campaign.fundingGoal)} ETH
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-700">
                          Raised:
                        </span>{" "}
                        {convertWeiToEth(campaign.totalFunds)} ETH
                      </p>
                      <Progress
                        value={
                          (Number(convertWeiToEth(campaign.totalFunds)) /
                            Number(convertWeiToEth(campaign.fundingGoal))) *
                          100
                        }
                        className="mt-2"
                      />
                      <span className="text-sm text-gray-500 ">
                        {getNumOfDaysLeft(campaign.deadline)} days left
                      </span>
                      {/* Button container for multiple buttons */}
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                          onClick={() => setDonateCampaign(campaign)}
                        >
                          Donate
                        </button>
                        {myCampaignAddresses.has(campaign.address) && (
                          <button
                            className={` px-4 py-2 rounded ${
                              isDeadlinePassed(campaign.deadline * 1000) &&
                              campaign.isActive
                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            title={
                              !campaign.isActive
                                ? "You can't finalize as the campaign is not active."
                                : !isDeadlinePassed(campaign.deadline * 1000)
                                  ? "You can't finalize as the campaign's deadline has not passed."
                                  : "Ready to finalize the campaign."
                            }
                            disabled={
                              !campaign.isActive ||
                              !isDeadlinePassed(campaign.deadline * 1000)
                            } // Disable button if the campaign is inactive or deadline hasn't passed
                            onClick={() => {
                              if (
                                isDeadlinePassed(campaign.deadline * 1000) &&
                                campaign.isActive
                              ) {
                                setCampaignToFinalize(campaign);
                              }
                            }}
                          >
                            Finalize Campaign
                          </button>
                        )}
                      </div>
                    </Card>
                  ),
              )}
            </div>
          )}
        </div>
      </main>
      <DonateCampaignDialog
        donateCampaign={donateCampaign}
        setDonateCampaign={setDonateCampaign}
        onDonationSuccess={() => {}}
      />
    </div>
  );
};

export default ActiveCampaigns;
