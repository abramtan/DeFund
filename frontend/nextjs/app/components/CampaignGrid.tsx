import React from "react";
import { CampaignCard } from "./CampaignCard";
import { Campaign } from "@/app/web3/campaign";

interface CampaignGridProps {
  campaigns: Campaign[];
  myCampaignAddresses: Set<string>;
  isDeadlinePassed: (timestamp: number) => boolean;
}

export const CampaignGrid: React.FC<CampaignGridProps> = ({
  campaigns,
  myCampaignAddresses,
  isDeadlinePassed,
}) => {
  // Sort campaigns so that active ones appear at the top
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (a.isActive === b.isActive) {
      return 0; // If both are active or inactive, maintain their order
    }
    return a.isActive ? -1 : 1; // Active campaigns come first
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedCampaigns.map((campaign) => (
        <CampaignCard
          key={campaign.address}
          campaign={campaign}
          isMyCampaign={myCampaignAddresses.has(campaign.address)}
          isDeadlinePassed={isDeadlinePassed}
        />
      ))}
    </div>
  );
};
