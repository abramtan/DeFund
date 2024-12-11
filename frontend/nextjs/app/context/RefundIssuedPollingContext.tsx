"use client";

import React, { createContext, useEffect, useState } from "react";
import {
  CAMPAIGN_FACTORY_BLOCK_NUMBER,
  EVENT_POLLING_INTERVAL,
} from "../web3/const";
import {
  getInactiveCampaigns,
  pollRefundIssuedEvents,
} from "../web3/functions";
import {
  convertToLocalStorageKey,
  getAccount,
  LocalStorageKeys,
} from "../web3/utils";

const RefundIssuedPollingContext = createContext(undefined);

export const RefundIssuedPollingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // State to store inactive campaign data
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
    const intervals: NodeJS.Timeout[] = []; //Array to store interval IDs

    inactiveCampaignAddresses.forEach((inactiveCampaignAddress) => {
      let latestBlock = Number(
        localStorage.getItem(
          convertToLocalStorageKey(
            LocalStorageKeys.RefundIssued,
            inactiveCampaignAddress,
          ),
        ) || CAMPAIGN_FACTORY_BLOCK_NUMBER,
      ); // Get the latest processed block from localStorage

      const setupPolling = async () => {
        const polling = async () => {
          latestBlock = await pollRefundIssuedEvents(
            inactiveCampaignAddress,
            latestBlock,
          );
        };

        polling();
        const interval = setInterval(polling, EVENT_POLLING_INTERVAL); //Schedule polling at regular intervals
        intervals.push(interval); // Store the interval ID for cleanup
      };

      setupPolling();
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval)); // Clear all intervals on cleanup
    };
  }, [inactiveCampaignAddresses]);

  return (
    <RefundIssuedPollingContext.Provider value={undefined}>
      {children}
    </RefundIssuedPollingContext.Provider>
  );
};
