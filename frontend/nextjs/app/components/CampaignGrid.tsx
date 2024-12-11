import { Campaign } from "@/app/web3/campaign";
import Link from "next/link";
import React, { useReducer } from "react";
import { CampaignCard } from "./CampaignCard";

interface CampaignGridProps {
  campaigns: Campaign[];
  myCampaignAddresses: Set<string>;
  isDeadlinePassed: (timestamp: number) => boolean;
  refetchCampaigns: () => void;
}

export const CampaignGrid: React.FC<CampaignGridProps> = ({
  campaigns,
  myCampaignAddresses,
  isDeadlinePassed,
  refetchCampaigns,
}) => {
  // Sort campaigns so that active ones appear at the top
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (a.isActive === b.isActive) {
      return 0; // If both are active or inactive, maintain their order
    }
    return a.isActive ? -1 : 1; // Active campaigns come first
  });

  return (
    <div>
      {sortedCampaigns.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold text-gray-800">No Campaigns</h2>
          <p className="mt-2 text-gray-600">
            It looks like there are no campaigns right now. Be the first to
            start one!
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.address}
              campaign={campaign}
              isMyCampaign={myCampaignAddresses.has(campaign.address)}
              isDeadlinePassed={isDeadlinePassed}
              reRenderCampaignGrid={refetchCampaigns}
            />
          ))}
        </div>
      )}
    </div>
  );
};
