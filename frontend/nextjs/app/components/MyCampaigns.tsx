import { Campaign } from "@/app/web3/campaign";
import { getMyCampaigns } from "@/app/web3/functions";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CampaignGrid } from "./CampaignGrid";

const MyCampaigns = () => {
  const [myCampaignAddresses, setMyCampaignAddresses] = useState<Set<string>>(
    new Set(),
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);

  const fetchMyCampaigns = async () => {
    setLoading(true); // Start loading
    try {
      const myCampaigns = await getMyCampaigns();
      const myCampaignAddresses = new Set(myCampaigns.map((c) => c.address));
      setMyCampaigns(myCampaigns); // Store campaigns
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
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Loading your campaigns...</p>
        </div>
      ) : myCampaignAddresses.size === 0 ? (
        // Display empty state message when there are no campaigns
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold text-gray-800">No Campaigns</h2>
          <p className="mt-2 text-gray-600">
            It looks like there are no campaigns that you started. Start one
            now!
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
          <CampaignGrid
            campaigns={myCampaigns}
            myCampaignAddresses={myCampaignAddresses}
            refetchCampaigns={fetchMyCampaigns}
          />
        </div>
      )}
    </div>
  );
};
export default MyCampaigns;
