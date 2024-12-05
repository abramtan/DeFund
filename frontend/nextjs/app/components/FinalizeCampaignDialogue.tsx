import { Campaign } from "@/app/web3/campaign";
import { SetStateAction } from "react";
import Button from "./Button";
import Dialog from "./Dialog";

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
  return (
    <Dialog
      isOpen={!!campaignToFinalize}
      onClose={() => setCampaignToFinalize(null)}
    >
      {campaignToFinalize && (
        <div>
          {/* Campaign Name and Deadline Message */}
          <h2 className="text-lg font-bold">{campaignToFinalize.name}</h2>
          <p className="mt-4 text-gray-700">
            <strong>{campaignToFinalize.name}</strong> has reached the deadline.
          </p>

          {/* Donations Information */}
          <p className="mt-2 text-gray-700">
            No more donations will be accepted.
          </p>

          {/* Outcome Information */}
          <p className="mt-4 text-gray-700">
            {campaignToFinalize.totalFunds >= campaignToFinalize.fundingGoal ? (
              <span>
                <strong>Outcome:</strong> You have reached your goal, and you
                can withdraw the funds.
              </span>
            ) : (
              <span>
                <strong>Outcome:</strong> You did not reach the goal, and the
                funds will be refunded to the donors.
              </span>
            )}
          </p>

          {/* Finalize and Close Buttons */}
          <div className="mt-6 flex space-x-4">
            <Button
              onClick={onCampaignToFinalize}
              disabled={isLoading}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isLoading ? "Processing..." : "Confirm"}
            </Button>
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
