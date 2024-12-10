import { Campaign } from "@/app/web3/campaign";
import { getActiveDeployedCampaigns } from "@/app/web3/functions";
import { useEffect, useState } from "react";
import { convertWeiToEth } from "../web3/utils";
import Card from "./Card";
import DonateCampaignDialog from "./DonateCampaignDialog";
import Progress from "./Progress";

const ActiveCampaigns = () => {
  const [donateCampaign, setDonateCampaign] = useState<Campaign | null>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);

  // Fetch active campaigns
  const fetchActiveCampaigns = async () => {
    try {
      const campaigns = await getActiveDeployedCampaigns();
      setActiveCampaigns(campaigns.filter(Boolean)); // Filter out invalid or null campaigns
    } catch (error) {
      console.error("Failed to fetch active campaigns:", error);
    }
  };

  useEffect(() => {
    fetchActiveCampaigns();
  }, []);

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

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeCampaigns.map(
              (campaign) =>
                campaign && ( // Validate the campaign object
                  <Card
                    key={campaign.address}
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => setDonateCampaign(campaign)}
                  >
                    <h2 className="font-semibold text-lg">{campaign.name}</h2>
                    <p className="text-sm text-gray-500">
                      Goal: {convertWeiToEth(campaign.fundingGoal)} ETH
                    </p>
                    <p className="text-sm text-gray-500">
                      Raised: {convertWeiToEth(campaign.totalFunds)} ETH
                    </p>
                    <Progress
                      value={
                        (Number(convertWeiToEth(campaign.totalFunds)) /
                          Number(convertWeiToEth(campaign.fundingGoal))) *
                        100
                      }
                      className="mt-2"
                    />
                    <span className="text-sm text-gray-500">
                      {getNumOfDaysLeft(campaign.deadline)} days left
                    </span>
                  </Card>
                ),
            )}
          </div>
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
