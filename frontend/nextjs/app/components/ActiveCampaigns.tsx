import { Campaign } from "@/app/web3/campaign";
import { getMyCampaigns } from "@/app/web3/functions";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CampaignGrid } from "./CampaignGrid";

const ActiveCampaigns = ({
  activeCampaigns,
}: {
  activeCampaigns: Campaign[];
}) => {
  const [myCampaignAddresses, setMyCampaignAddresses] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Utility function to check if the deadline has passed
  const isDeadlinePassed = (deadline: number): boolean => {
    return Date.now() >= deadline;
  };

  const fetchMyCampaigns = async () => {
    setLoading(true); // Start loading
    try {
      const myCampaigns = await getMyCampaigns();
      const myCampaignAddresses = new Set(myCampaigns.map((c) => c.address));
      setMyCampaignAddresses(myCampaignAddresses);
    } catch (error) {
      console.error("Error fetching my campaigns:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  return (
    <div>
      {activeCampaigns.length === 0 ? (
        // Display empty state message when there are no active campaigns
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold text-gray-800">
            No Active Campaigns
          </h2>
          <p className="mt-2 text-gray-600">
            It looks like there are no active campaigns right now. Be the first
            to start one!
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
        <div>
          <h1 className="text-2xl font-bold mb-6">Active Campaigns</h1>
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-600">Loading active campaigns...</p>
            </div>
          ) : (
            <CampaignGrid
              campaigns={activeCampaigns}
              myCampaignAddresses={myCampaignAddresses}
              isDeadlinePassed={isDeadlinePassed}
              refetchCampaigns={fetchMyCampaigns}
            />
          )}
        </div>
      )}
    </div>
  );
};
export default ActiveCampaigns;
