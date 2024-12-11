import { Campaign } from "@/app/web3/campaign";
import { useEffect, useState, SetStateAction } from "react";
import Button from "./Button";
import Dialog from "./Dialog";
import { convertWeiToEth } from "../web3/utils";

const FinalizeCampaignDialog = ({
  campaignToFinalize,
  setCampaignToFinalize,
  onCampaignToFinalize,
  isLoading,
}: {
  campaignToFinalize: Campaign | null; // The campaign to finalize
  setCampaignToFinalize: (value: SetStateAction<Campaign | null>) => void; // Function to close the dialog
  onCampaignToFinalize: () => void; // Callback to finalize the campaign
  isLoading: boolean; // Loading state for the finalize process
}) => {
  const [outcome, setOutcome] = useState("");
  // Use `useEffect` to set the outcome when `campaignToFinalize` changes
  useEffect(() => {
    if (campaignToFinalize) {
      if (campaignToFinalize.totalFunds >= campaignToFinalize.fundingGoal) {
        setOutcome("withdraw");
      } else {
        setOutcome("refunded");
      }
    }
  }, [campaignToFinalize]); // Dependency array ensures this runs only when `campaignToFinalize` changes

  // If `campaignToFinalize` is null, return null or an empty fragment
  if (!campaignToFinalize) {
    return null;
  }

  return (
    <Dialog
      isOpen={!!campaignToFinalize}
      onClose={() => setCampaignToFinalize(null)}
    >
      {campaignToFinalize && (
        <div>
          {/* Campaign Name and Deadline Message */}
          <h2 className="text-xl font-bold mb-4 text-indigo-600">
            Finalize {campaignToFinalize.name}
          </h2>
          <p className="text-sm text-gray-800 mb-1">
            The deadline{" "}
            {new Date(campaignToFinalize.deadline * 1000).toDateString()} is
            reached and no more donations will be accepted.
          </p>
          {/*Amount raised */}
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-semibold text-gray-700">You raised:</span>{" "}
            {convertWeiToEth(campaignToFinalize.totalFunds)}/
            {convertWeiToEth(campaignToFinalize.fundingGoal)} ETH
          </p>
          {/* Outcome Information */}

          {campaignToFinalize.totalFunds >= campaignToFinalize.fundingGoal ? (
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold text-gray-700">Outcome:</span>
              You have reached your goal, and you can {outcome}
              the funds.{" "}
            </p>
          ) : (
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold text-gray-700"></span>
              <span className="font-semibold text-gray-700">Outcome: </span>
              You did not reach the goal, and the funds will be {
                outcome
              } to the donors.
            </p>
          )}

          {/* Finalize and Close Buttons */}
          <div className="mt-6 flex space-x-4">
            <button
              className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg"
              onClick={onCampaignToFinalize}
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : outcome === "withdraw"
                  ? "Withdraw Funds"
                  : "Refund to Donors"}
            </button>
            <Button
              onClick={() => setCampaignToFinalize(null)}
              disabled={isLoading}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default FinalizeCampaignDialog;
