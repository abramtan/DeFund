import { Campaign } from "@/app/web3/campaign";
import {
  finalizeCampaign,
  getAllDeployedCampaigns,
  getMyCampaigns,
} from "@/app/web3/functions";
import { useEffect, useState } from "react";
import { convertWeiToEth } from "../web3/utils";
import Card from "./Card";
import DonateCampaignDialog from "./DonateCampaignDialog";
import FinalizeCampaignDialog from "./FinalizeCampaignDialogue";
import Progress from "./Progress";

const ExploreCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myCampaignAddresses, setMyCampaignAddresses] = useState<Set<string>>(
    new Set(),
  );
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<
    "name" | "deadline" | "fundingGoal" | "totalFunds"
  >("name");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive" | "myCampaigns"
  >("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [donateCampaign, setDonateCampaign] = useState<Campaign | null>(null);
  const [campaignToFinalize, setCampaignToFinalize] = useState<Campaign | null>(
    null,
  );

  // Utility function to check if the deadline has passed
  const isDeadlinePassed = (deadline: number): boolean => {
    return Date.now() >= deadline;
  };
  // Fetch all campaigns on mount
  // Fetch campaigns belonging to user
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Fetch all campaigns
        const allCampaigns = await getAllDeployedCampaigns();

        // Fetch campaigns owned by the user
        const myCampaigns = await getMyCampaigns();

        // Create a Set of campaign addresses owned by the user
        const myCampaignAddresses = new Set(myCampaigns.map((c) => c.address));

        // Save campaigns and ownership information to state
        setCampaigns(allCampaigns); // All campaigns
        setFilteredCampaigns(allCampaigns); // Initialize filtered campaigns
        setMyCampaignAddresses(myCampaignAddresses); // Save ownership info
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  }, []);

  // Filter campaigns when filterActive changes
  useEffect(() => {
    const applyFilters = async () => {
      let filtered = [...campaigns];
      if (filterActive === "myCampaigns") {
        try {
          const myCampaigns = await getMyCampaigns(); // Fetch user's campaigns
          filtered = myCampaigns;
          console.log("Filtered my campaigns:", myCampaigns); // Debugging
        } catch (error) {
          console.error("Error fetching my campaigns:", error);
        }
      } else if (filterActive === "active") {
        filtered = filtered.filter((campaign) => campaign.isActive);
        console.log("Filtered active campaigns:", filtered); // Debugging
      } else if (filterActive === "inactive") {
        filtered = filtered.filter((campaign) => !campaign.isActive);
        console.log("Filtered inactive campaigns:", filtered); // Debugging
      } else if (filterActive === "all") {
        filtered = [...campaigns]; // Show all campaigns
        console.log("Filtered all campaigns:", filtered); // Debugging
      }

      setFilteredCampaigns(filtered); // Update the filtered campaigns
      console.log("Updated filtered campaigns:", filtered); // Debugging
    };

    applyFilters();
  }, [filterActive, campaigns]);

  // Filter and sort campaigns when search term, filter, or sort key changes
  useEffect(() => {
    let filtered = [...campaigns];

    // Filter by active/inactive status
    if (filterActive === "active") {
      filtered = filtered.filter((campaign) => campaign.isActive);
    } else if (filterActive === "inactive") {
      filtered = filtered.filter((campaign) => !campaign.isActive);
    }

    // Search by name or description
    if (searchTerm) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort campaigns
    filtered.sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortKey === "deadline") {
        return a.deadline - b.deadline;
      }
      if (sortKey === "fundingGoal") {
        return b.fundingGoal - a.fundingGoal;
      }
      if (sortKey === "totalFunds") {
        return b.totalFunds - a.totalFunds;
      }
      return 0;
    });

    setFilteredCampaigns(filtered);
  }, [campaigns, searchTerm, sortKey, filterActive]);

  return (
    <div>
      {/* Controls for search, filter, and sort */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full md:w-1/3"
        />
        <div className="flex space-x-4">
          <select
            value={filterActive}
            onChange={(e) =>
              setFilterActive(
                e.target.value as "all" | "active" | "inactive" | "myCampaigns",
              )
            }
            className="border border-gray-300 rounded p-2"
          >
            <option value="all">All Campaigns</option>
            <option value="active">Active Campaigns</option>
            <option value="inactive">Inactive Campaigns</option>
            <option value="myCampaigns">My Campaigns</option>
          </select>
          <select
            value={sortKey}
            onChange={(e) =>
              setSortKey(
                e.target.value as
                  | "name"
                  | "deadline"
                  | "fundingGoal"
                  | "totalFunds",
              )
            }
            className="border border-gray-300 rounded p-2"
          >
            <option value="name">Sort by Name</option>
            <option value="deadline">Sort by Deadline</option>
            <option value="fundingGoal">Sort by Funding Goal</option>
            <option value="totalFunds">Sort by Total Funds Raised</option>
          </select>
        </div>
      </div>

      {/* Render campaign cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.map((campaign) => (
          <Card
            key={campaign.address}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          >
            <h2 className="font-semibold text-lg">{campaign.name}</h2>
            <p className="text-sm text-gray-500">{campaign.description}</p>
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
            <p className="text-sm text-gray-500">
              Deadline: {new Date(campaign.deadline * 1000).toDateString()}
            </p>
            <p
              className={`text-sm font-semibold mt-2 ${
                campaign.isActive ? "text-green-500" : "text-red-500"
              }`}
            >
              {campaign.isActive ? "Active" : "Inactive"}
            </p>
            {campaign.isActive && (
              <button
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => setDonateCampaign(campaign)}
              >
                Donate
              </button>
            )}

            {myCampaignAddresses.has(campaign.address) && (
              <button
                className={`mt-4 px-4 py-2 rounded ${
                  isDeadlinePassed(campaign.deadline * 1000) &&
                  campaign.isActive
                    ? "bg-blue-500 text-white hover:bg-blue-600"
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
          </Card>
        ))}
      </div>
      <DonateCampaignDialog
        donateCampaign={donateCampaign}
        setDonateCampaign={setDonateCampaign}
        onDonationSuccess={() => {}}
      />
      <FinalizeCampaignDialog
        campaignToFinalize={campaignToFinalize}
        setCampaignToFinalize={setCampaignToFinalize}
        onCampaignToFinalize={async () => {
          if (!campaignToFinalize) return;

          try {
            console.log("Frontend Raw Deadline:", campaignToFinalize.deadline);
            console.log(
              "Frontend Deadline Type:",
              typeof campaignToFinalize.deadline,
            );
            console.log("System Time:", new Date(Date.now()));
            setIsLoading(true); // Set loading state
            await finalizeCampaign(campaignToFinalize.address); // Call the finalize function
            alert("Campaign finalized successfully!");
            setCampaignToFinalize(null); // Close the dialog after success
          } catch (error) {
            console.error("Error finalizing campaign:", error);
            alert("Failed to finalize the campaign. Please try again.");
          } finally {
            setIsLoading(false); // Reset loading state
          }
        }}
        isLoading={false} // Replace with real loading state
      />
    </div>
  );
};

export default ExploreCampaigns;
