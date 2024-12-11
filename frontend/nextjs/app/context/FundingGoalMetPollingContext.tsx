"use client";

import React, { createContext, useEffect, useState } from "react";
import {
  CAMPAIGN_FACTORY_BLOCK_NUMBER,
  EVENT_POLLING_INTERVAL,
} from "../web3/const";
import {
  getInactiveCampaigns,
  getMyActiveCampaigns,
  pollFundingGoalMetEvents,
} from "../web3/functions";
import {
  convertToLocalStorageKey,
  getAccount,
  LocalStorageKeys,
} from "../web3/utils";

const FundingGoalMetPollingContext = createContext(undefined);

export const FundingGoalMetPollingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [myActiveCampaignAddresses, setMyActiveCampaignAddresses] = useState<
    string[]
  >([]); // State to store active campaign addresses

  // Fetch the list of active campaigns for the user
  useEffect(() => {
    // If user has not connected their Metamask, then do not start the polling
    try {
      const account = getAccount();

      if (account) {
        const doGetMyActiveCampaigns = async () => {
          const myActiveCampaigns = await getMyActiveCampaigns(); // Fetch active campaigns
          const addresses = myActiveCampaigns.map(
            (myActiveCampaign) => myActiveCampaign.address,
          );
          setMyActiveCampaignAddresses(addresses); // Update state with campaign addresses
        };
        doGetMyActiveCampaigns();
      }
    } catch (error) {}
  }, []);

  // Set up polliing for each campaign in the list of active campaigns
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []; // Array to store interval IDs

    myActiveCampaignAddresses.forEach((myActiveCampaignAddress) => {
      let latestBlock = Number(
        localStorage.getItem(
          convertToLocalStorageKey(
            LocalStorageKeys.FundingGoalMet,
            myActiveCampaignAddress,
          ),
        ) || CAMPAIGN_FACTORY_BLOCK_NUMBER,
      ); // Get the latest processed block from localStorage

      const setupPolling = async () => {
        const polling = async () => {
          latestBlock = await pollFundingGoalMetEvents(
            myActiveCampaignAddress,
            latestBlock,
          );
        };

        polling();
        const interval = setInterval(polling, EVENT_POLLING_INTERVAL); // Schedule polling at regular intervals
        intervals.push(interval); // Store the interval ID for cleanup
      };

      setupPolling();
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval)); // Clear all intervals on cleanup
    };
  }, [myActiveCampaignAddresses]);

  return (
    <FundingGoalMetPollingContext.Provider value={undefined}>
      {children}
    </FundingGoalMetPollingContext.Provider>
  );
};
