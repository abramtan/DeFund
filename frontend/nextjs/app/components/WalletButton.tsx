import { Dispatch, SetStateAction } from "react";
import Button from "./Button";
import { LocalStorageKeys } from "../web3/utils";

const WalletButton = ({
  account,
  setAccount,
}: {
  account: string | null;
  setAccount: Dispatch<SetStateAction<string | null>>;
}) => {
  const connectWallet = async (): Promise<string | null> => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        return accounts[0];
      } catch (error) {
        console.error("User denied account access");
        return null;
      }
    } else {
      alert("Please install MetaMask!");
      return null;
    }
  };

  const handleConnectWallet = async () => {
    const connectedAccount = await connectWallet();
    if (connectedAccount) {
      setAccount(connectedAccount);
      localStorage.setItem(LocalStorageKeys.Account, connectedAccount);
    }
  };

  return (
    <div className="hidden sm:ml-6 sm:flex sm:items-center">
      <Button variant="outline" onClick={handleConnectWallet}>
        {account
          ? `${account.slice(0, 6)}...${account.slice(-4)}`
          : "Connect Wallet"}
      </Button>
    </div>
  );
};

export default WalletButton;
