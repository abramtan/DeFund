import { Campaign } from "@/app/web3/campaign";
import { finalizeCampaign, getNumDonors } from "@/app/web3/functions";
import React, { useEffect, useState } from "react";
import { MAX_NUM_DONORS } from "../web3/const";
import { bytes32ToString, convertWeiToEth, getAccount } from "../web3/utils";
import DonateCampaignDialog from "./DonateCampaignDialog"; // Import your dialog components
import FinalizeCampaignDialog from "./FinalizeCampaignDialogue";
import Notification from "./Notification";
import Progress from "./Progress"; // Assuming you have a progress bar component

interface CampaignCardProps {
  campaign: Campaign; // You can define a `Campaign` interface for your campaign object
  isMyCampaign: boolean;
  reRenderCampaignGrid: () => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  isMyCampaign,
  reRenderCampaignGrid,
}) => {
  const [donateCampaign, setDonateCampaign] = useState<Campaign | null>(null);
  const [campaignToFinalize, setCampaignToFinalize] = useState<Campaign | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false); // Loading state for finalizing campaigns
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(""); // Store the notification message
  const [numDonors, setNumDonors] = useState<number>(0);

  // Utility function to check if the deadline has passed
  const isDeadlinePassed = (deadline: number): boolean => {
    return Date.now() >= deadline + 60 * 1000;
  };

  const handleDonationSuccess = () => {
    setNotificationMessage(`Donation successful!`);
    setIsNotificationOpen(true);
    setDonateCampaign(null); // Close the dialog
    reRenderCampaignGrid(); // Re-renders the Campaign Grid
  };

  const handleCampaignFinalization = async () => {
    if (!campaignToFinalize) return;

    try {
      setIsLoading(true); // Set loading state

      const success = await finalizeCampaign(campaignToFinalize.address); // Call the finalize function

      if (success) {
        setNotificationMessage("Campaign successfully finalized!");
        setIsNotificationOpen(true);
        setCampaignToFinalize(null); // Close the dialog after success
      }
    } catch (error) {
      console.error("Error finalizing campaign:", error);
      setNotificationMessage("Failed to finalize the campaign.");
      setIsNotificationOpen(true);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  useEffect(() => {
    const doGetDonors = async () => {
      const numDonorsRaw = await getNumDonors(campaign.address);
      setNumDonors(numDonorsRaw);
    };
    doGetDonors();
  }, []);

  const getFormattedDeadline = (date: Date): string => {
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let time = date.toLocaleTimeString();

    return `${day}/${month}/${year}, ${time}`;
  };

  return (
    <div className="p-4 shadow-md border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-200">
      {/* Campaign Name */}
      <h2 className="font-semibold text-lg text-gray-800 mb-2">
        {bytes32ToString(campaign.name)}
      </h2>

      {/* Campaign Goal */}
      <p className="text-sm text-gray-500 mb-1">
        <span className="font-semibold text-gray-700">Goal:</span>{" "}
        {convertWeiToEth(campaign.fundingGoal)} ETH
      </p>

      {/* Campaign Raised */}
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-700">Raised:</span>{" "}
        {convertWeiToEth(campaign.totalFunds)} ETH
      </p>

      {/* Progress Bar */}
      <Progress
        value={
          Math.min(
            Number(convertWeiToEth(campaign.totalFunds)) /
              Number(convertWeiToEth(campaign.fundingGoal)),
          ) * 100
        }
        className="mt-2"
      />

      {/* Deadline */}
      <p className="text-sm text-gray-500 mb-1">
        <span className="font-semibold text-gray-700">Deadline:</span>{" "}
        {getFormattedDeadline(new Date(campaign.deadline * 1000))}
      </p>

      {/* Number of Donors */}
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-700">Number of donors:</span>{" "}
        {numDonors}/{MAX_NUM_DONORS}
      </p>

      {/* Campaign Status */}
      <p
        className={`text-sm font-semibold mt-2 ${
          campaign.isActive ? "text-green-500" : "text-red-500"
        }`}
      >
        {campaign.isActive ? "Active" : "Inactive"}
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-2 mt-4">
        {campaign.isActive &&
          campaign.totalFunds < campaign.fundingGoal &&
          numDonors < MAX_NUM_DONORS && (
            <button
              className={`px-4 py-2 rounded-lg ${
                !isDeadlinePassed(campaign.deadline * 1000) &&
                campaign.isActive &&
                campaign.beneficiary.toLowerCase() != getAccount()
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={
                !campaign.isActive ||
                isDeadlinePassed(campaign.deadline * 1000) ||
                campaign.totalFunds >= campaign.fundingGoal ||
                campaign.beneficiary.toLowerCase() === getAccount()
              }
              onClick={() => setDonateCampaign(campaign)}
            >
              Donate
            </button>
          )}
        {isMyCampaign && (
          <button
            className={`px-4 py-2 rounded-lg ${
              (isDeadlinePassed(campaign.deadline * 1000) ||
                campaign.totalFunds >= campaign.fundingGoal) &&
              campaign.isActive
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            title={
              campaign.isActive
                ? isDeadlinePassed(campaign.deadline * 1000) ||
                  campaign.totalFunds >= campaign.fundingGoal
                  ? "Ready to finalize this campaign."
                  : "You can't finalize as the campaign's deadline has not passed or funding goal not met"
                : "You can't finalize as the campaign is not active."
            }
            disabled={
              !campaign.isActive &&
              (!isDeadlinePassed(campaign.deadline * 1000) ||
                campaign.totalFunds < campaign.fundingGoal)
            }
            onClick={() => {
              if (
                (isDeadlinePassed(campaign.deadline * 1000) ||
                  campaign.totalFunds >= campaign.fundingGoal) &&
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

      {/* Donate Campaign Dialog */}
      {donateCampaign && (
        <DonateCampaignDialog
          donateCampaign={donateCampaign}
          setDonateCampaign={setDonateCampaign}
          onDonationSuccess={handleDonationSuccess}
        />
      )}

      {/* Finalize Campaign Dialog */}
      {campaignToFinalize && (
        <FinalizeCampaignDialog
          campaignToFinalize={campaignToFinalize}
          setCampaignToFinalize={setCampaignToFinalize}
          onCampaignToFinalize={handleCampaignFinalization}
          isLoading={isLoading} // Pass real loading state
        />
      )}
      {/* Notification Component */}
      <Notification
        isOpen={isNotificationOpen}
        message={notificationMessage}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
};
