import { Campaign } from "@/app/web3/campaign";
import { SetStateAction } from "react";
import Button from "./Button";
import Dialog from "./Dialog";

const FinalizeCampaignDialog = ({
  selectedCampaign,
  setSelectedCampaign,
  onFinalizeCampaign,
  isLoading,
}: {
  selectedCampaign: Campaign | null; // The campaign to finalize
  setSelectedCampaign: (value: SetStateAction<Campaign | null>) => void; // Function to close the dialog
  onFinalizeCampaign: () => void; // Callback to finalize the campaign
  isLoading: boolean; // Loading state for the finalize process
}) => {
  return (
    <Dialog
      isOpen={!!selectedCampaign}
      onClose={() => setSelectedCampaign(null)}
    >
      {selectedCampaign && (
        <div>
          {/* Campaign Name and Deadline Message */}
          <h2 className="text-lg font-bold">{selectedCampaign.name}</h2>
          <p className="mt-4 text-gray-700">
            <strong>{selectedCampaign.name}</strong> has reached the deadline.
          </p>

          {/* Donations Information */}
          <p className="mt-2 text-gray-700">
            No more donations will be accepted.
          </p>

          {/* Outcome Information */}
          <p className="mt-4 text-gray-700">
            {selectedCampaign.totalFunds >= selectedCampaign.fundingGoal ? (
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
              onClick={onFinalizeCampaign}
              disabled={isLoading}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isLoading ? "Processing..." : "Confirm"}
            </Button>
            <Button
              onClick={() => setSelectedCampaign(null)}
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
