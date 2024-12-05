import { Campaign } from "@/app/web3/campaign";
import { SetStateAction, useState } from "react";
import { donateToCampaign } from "../web3/functions";
import Button from "./Button";
import Dialog from "./Dialog";
import { convertWeiToEth } from "../web3/utils";

const DonateCampaignDialog = ({
  donateCampaign,
  setDonateCampaign,
  onDonationSuccess,
}: {
  donateCampaign: Campaign | null;
  setDonateCampaign: (value: SetStateAction<Campaign | null>) => void;
  onDonationSuccess: () => void; // Callback to refresh active campaigns after donation
}) => {
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDonate = async () => {
    if (!donateCampaign || !donationAmount || Number(donationAmount) <= 0) {
      alert("Please select a campaign and enter a valid donation amount.");
      return;
    }

    try {
      setIsLoading(true);
      await donateToCampaign(donateCampaign.address, Number(donationAmount));

      alert("Donation successful!");
      setDonateCampaign(null); // Close the dialog

      // Trigger the refresh of active campaigns
      onDonationSuccess();
    } catch (error) {
      console.error("Error during donation:", error);
      alert("Donation failed! Please check your wallet and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog isOpen={!!donateCampaign} onClose={() => setDonateCampaign(null)}>
      {donateCampaign && (
        <div>
          <h2 className="text-lg font-bold">{donateCampaign.name}</h2>
          <p className="mt-4">{donateCampaign.description}</p>
          <p className="mt-4">{`Deadline: ${new Date(
            donateCampaign.deadline,
          ).toDateString()}`}</p>
          <p className="mt-4">{`Beneficiary: ${donateCampaign.beneficiary}`}</p>
          <p className="mt-4">{`Campaign Address: ${donateCampaign.address}`}</p>
          <div className="mt-4">
            <input
              type="number"
              placeholder="Enter amount in ETH"
              value={donationAmount}
              onChange={(e) => {
                const value = e.target.value;
                if (!isNaN(Number(value))) setDonationAmount(value);
              }}
              className="border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div className="mt-6 flex space-x-4">
            <Button onClick={handleDonate} disabled={isLoading}>
              {isLoading ? "Processing..." : "Donate"}
            </Button>
            <Button
              onClick={() => setDonateCampaign(null)}
              disabled={isLoading}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default DonateCampaignDialog;