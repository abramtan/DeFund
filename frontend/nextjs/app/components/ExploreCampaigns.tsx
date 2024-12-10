import { Campaign } from "@/app/web3/campaign";
import { getAllDeployedCampaigns, getMyCampaigns } from "@/app/web3/functions";
import { useEffect, useState } from "react";
import { CampaignGrid } from "./CampaignGrid";

const ExploreCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [myCampaignAddresses, setMyCampaignAddresses] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<
    "name" | "deadline" | "fundingGoal" | "totalFunds"
  >("name");
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive" | "myCampaigns"
  >("all");

  // Utility function to check if the deadline has passed
  const isDeadlinePassed = (deadline: number): boolean => {
    return Date.now() >= deadline;
  };

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const allCampaigns = await getAllDeployedCampaigns();
        const myCampaigns = await getMyCampaigns();
        const myAddresses = new Set(myCampaigns.map((c) => c.address));

        setCampaigns(allCampaigns);
        setFilteredCampaigns(allCampaigns); // Initialize filtered campaigns
        setMyCampaignAddresses(myAddresses);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchCampaigns();
  }, []);

  // Filter campaigns based on active filter
  useEffect(() => {
    let filtered = [...campaigns];

    if (filterActive === "myCampaigns") {
      filtered = campaigns.filter((c) => myCampaignAddresses.has(c.address));
    } else if (filterActive === "active") {
      filtered = campaigns.filter((c) => c.isActive);
    } else if (filterActive === "inactive") {
      filtered = campaigns.filter((c) => !c.isActive);
    }

    setFilteredCampaigns(filtered);
  }, [filterActive, campaigns, myCampaignAddresses]);

  // Filter and sort campaigns when search term or sort key changes
  useEffect(() => {
    let filtered = [...campaigns];

    // Search campaigns by name or description
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort campaigns
    filtered.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "deadline") return a.deadline - b.deadline;
      if (sortKey === "fundingGoal") return b.fundingGoal - a.fundingGoal;
      if (sortKey === "totalFunds") return b.totalFunds - a.totalFunds;
      return 0;
    });

    setFilteredCampaigns(filtered);
  }, [searchTerm, sortKey, campaigns]);

  return (
    <div>
      {/* Search, Filter, and Sort Controls */}
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

      {/* Campaign Grid */}
      <CampaignGrid
        campaigns={filteredCampaigns}
        myCampaignAddresses={myCampaignAddresses}
        isDeadlinePassed={isDeadlinePassed}
      />
    </div>
  );
};

export default ExploreCampaigns;
