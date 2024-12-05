import { Campaign } from "@/app/web3/campaign";
import { getAllDeployedCampaigns, getMyCampaigns } from "@/app/web3/functions";
import { useEffect, useState } from "react";
import Card from "./Card";
import Progress from "./Progress";
import SelectedCampaignDialog from "./SelectedCampaignDialog";
import { convertWeiToEth } from "../web3/utils";

const ExploreCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<
    "name" | "deadline" | "fundingGoal" | "totalFunds"
  >("name");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive" | "myCampaigns"
  >("all");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );

  // Fetch all campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      const allCampaigns = await getAllDeployedCampaigns(); // Fetch both active and inactive campaigns
      setCampaigns(allCampaigns);
      setFilteredCampaigns(allCampaigns); // Initialize filtered campaigns
      console.log("Fetched all campaigns:", allCampaigns); // Debugging
    };
    fetchCampaigns();
  }, []);

  // Attempt 2
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
            onClick={() => {
              if (campaign.isActive) setSelectedCampaign(campaign);
            }}
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
              Deadline: {new Date(campaign.deadline).toDateString()}
            </p>
            <p
              className={`text-sm font-semibold mt-2 ${
                campaign.isActive ? "text-green-500" : "text-red-500"
              }`}
            >
              {campaign.isActive ? "Active" : "Inactive"}
            </p>
          </Card>
        ))}
      </div>
      <SelectedCampaignDialog
        selectedCampaign={selectedCampaign}
        setSelectedCampaign={setSelectedCampaign}
        onDonationSuccess={() => {}}
      />
    </div>
  );
};

export default ExploreCampaigns;
