import { useState } from "react";
import { SetStateAction } from "react";
import { Campaign } from "@/app/web3/campaign";
import Web3 from "web3";
import Button from "./Button";
import Dialog from "./Dialog";

const SelectedCampaignDialog = ({
  selectedCampaign,
  setSelectedCampaign,
  onDonationSuccess,
}: {
  selectedCampaign: Campaign | null;
  setSelectedCampaign: (value: SetStateAction<Campaign | null>) => void;
  onDonationSuccess: () => void; // Callback to refresh active campaigns after donation
}) => {
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get the user's Ethereum account
  const getAccount = () => {
    return localStorage.getItem("account");
  };

  const handleDonate = async () => {
    if (!selectedCampaign || !donationAmount) {
      alert("Please select a campaign and enter a valid donation amount.");
      return;
    }

    try {
      setIsLoading(true);

      // Initialize Web3 instance
      const web3 = new Web3(window.ethereum);

      // Convert donation amount to Wei
      const amountInWei = web3.utils.toWei(donationAmount, "ether");

      // Send the transaction to the campaign's `donate` method
      await selectedCampaign.contract.methods
        .donate()
        .send({ from: getAccount(), value: amountInWei });

      alert("Donation successful!");
      setSelectedCampaign(null); // Close the dialog

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
          <p className="mt-4">{`Campaign Address: ${selectedCampaign.address}`}</p>
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
            <Button onClick={() => setSelectedCampaign(null)} disabled={isLoading}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default SelectedCampaignDialog;