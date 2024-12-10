"use client";

import React, { createContext, useEffect, useState } from "react";
import {
  CAMPAIGN_FACTORY_BLOCK_NUMBER,
  EVENT_POLLING_INTERVAL,
} from "../web3/const";
import {
  getInactiveCampaigns,
  pollCampaignFinalizedEvents,
} from "../web3/functions";
import { getAccount } from "../web3/utils";

// Define the context type for storing finalized campaign data
interface CampaignFinalizedContextType {
  campaignFinalized: {
    campaignAddress: string;
    beneficiary: string;
    success: boolean;
    totalFunds: string;
  }[];
}

// Create a React context to provide campaign finalized data to child components
const CampaignFinalizedContext = createContext<
  CampaignFinalizedContextType | undefined
>(undefined);

export const CampaignFinalizedPollingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [campaignFinalized, setCampaignFinalized] = useState<
    {
      campaignAddress: string;
      beneficiary: string;
      success: boolean;
      totalFunds: string;
    }[]
  >([]); // State to store finalized campaign data
  const [inactiveCampaignAddresses, setInactiveCampaignAddress] = useState<
    string[]
  >([]);

  // Fetch the list of all inactive campaigns
  useEffect(() => {
    // If user has not connected their Metamask, then do not start the polling
    try {
      const account = getAccount();

      if (account) {
        const doGetInactiveCampaigns = async () => {
          const inactiveCampaigns = await getInactiveCampaigns(); // Fetch inactive campaigns
          const addresses = inactiveCampaigns.map(
            (inactiveCampaign) => inactiveCampaign.address,
          );
          setInactiveCampaignAddress(addresses);
        };
        doGetInactiveCampaigns();
      }
    } catch (error) {}
  }, []);

  // Set up polling for each campaign in the list of inactive campaigns
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []; // Array to sore interval IDs

    inactiveCampaignAddresses.forEach((inactiveCampaignAddress) => {
      let latestBlock = Number(
        localStorage.getItem(
          `campaignFinalized_latestBlock_${inactiveCampaignAddress}`,
        ) || CAMPAIGN_FACTORY_BLOCK_NUMBER,
      ); // Get the latest processed block from localStorage

      const setupPolling = async () => {
        const polling = async () => {
          latestBlock = await pollCampaignFinalizedEvents(
            inactiveCampaignAddress,
            latestBlock,
            setCampaignFinalized,
          );
        };

        polling(); // Trigger an immediate poll
        const interval = setInterval(polling, EVENT_POLLING_INTERVAL); // Schedule polling at regular intervals
        intervals.push(interval); // Store the interval ID for cleanup
      };

      setupPolling();
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval)); // Clear all intervals on cleanup
    };
  }, [inactiveCampaignAddresses]);

  return (
    <CampaignFinalizedContext.Provider value={{ campaignFinalized }}>
      {children}
    </CampaignFinalizedContext.Provider>
  );
};
