import { SetStateAction } from "react";
import { Campaign } from "web3/campaign";
import Button from "./Button";
import Dialog from "./Dialog";

const SelectedCampaignDialog = ({
  selectedCampaign,
  setSelectedCampaign,
}: {
  selectedCampaign: Campaign | null;
  setSelectedCampaign: (value: SetStateAction<Campaign | null>) => void;
}) => {
  return (
    <Dialog
      isOpen={!!selectedCampaign}
      onClose={() => setSelectedCampaign(null)}
    >
      {selectedCampaign && (
        <div>
          <h2 className="text-lg font-bold">{selectedCampaign.name}</h2>
          <p className="mt-4">{selectedCampaign.description}</p>
          <p className="mt-4">{`Deadline: ${new Date(
            selectedCampaign.deadline,
          ).toDateString()}`}</p>
          <p className="mt-4">{`Beneficiary: ${selectedCampaign.beneficiary}`}</p>
          <div className="mt-6">
            <Button onClick={() => setSelectedCampaign(null)}>Close</Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default SelectedCampaignDialog;
