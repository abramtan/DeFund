import { useEffect, useState } from "react";
import { Campaign } from "web3/campaign";
import { getActiveDeployedCampaigns } from "web3/functions";
import Card from "./Card";
import Progress from "./Progress";
import SelectedCampaignDialog from "./SelectedCampaignDialog";

const ActiveCampaigns = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const callGetActiveDeployedCampaigns = async () => {
      const activeCampaigns = await getActiveDeployedCampaigns();
      setActiveCampaigns(activeCampaigns);
    };
    callGetActiveDeployedCampaigns();
  }, []);

  useEffect(() => {}, [activeCampaigns]);

  const getNumOfDaysLeft = (timestamp: number): number => {
    const today = new Date();
    const todayTimestamp = today.setHours(0, 0, 0, 0);
    const differenceInMilliseconds = Math.abs(timestamp - todayTimestamp);
    const differenceInDays = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24),
    );
    return differenceInDays;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeCampaigns.map((campaign) => (
              <Card
                key={campaign.address}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => setSelectedCampaign(campaign)}
              >
                <h2 className="font-semibold text-lg">{campaign.name}</h2>
                <p className="text-sm text-gray-500">
                  Goal: {campaign.fundingGoal} ETH
                </p>
                <p className="text-sm text-gray-500">
                  Raised: {campaign.totalFunds} ETH
                </p>
                <Progress
                  value={(campaign.totalFunds / campaign.fundingGoal) * 100}
                  className="mt-2"
                />
                <span className="text-sm text-gray-500">
                  {getNumOfDaysLeft(campaign.deadline)} days left
                </span>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <SelectedCampaignDialog
        selectedCampaign={selectedCampaign}
        setSelectedCampaign={setSelectedCampaign}
      />
    </div>
  );
};

export default ActiveCampaigns;
