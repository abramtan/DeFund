"use client";

import React, { createContext, useEffect, useState } from "react";
import { EVENT_POLLING_INTERVAL } from "../web3/const";
import {
  getMyActiveCampaigns,
  pollDonationMadeEvents,
} from "../web3/functions";

// Define the context type for storing donation data
interface DonationMadeContextType {
  donations: { campaignAddress: string; donor: string; amount: string }[];
}

// Create a React context to provide donation data to child components
const DonationMadePollingContext = createContext<
  DonationMadeContextType | undefined
>(undefined);

export const DonationMadePollingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [donations, setDonations] = useState<
    { campaignAddress: string; donor: string; amount: string }[]
  >([]); // State to store donation data
  const [myActiveCampaignAddresses, setMyActiveCampaignAddresses] = useState<
    string[]
  >([]); // State to store active campaign addresses

  // Fetch the list of active campaigns for the user
  useEffect(() => {
    const doGetMyActiveCampaigns = async () => {
      const myActiveCampaigns = await getMyActiveCampaigns(); // Fetch active campaigns
      const addresses = myActiveCampaigns.map(
        (myActiveCampaign) => myActiveCampaign.address,
      );
      setMyActiveCampaignAddresses(addresses); // Update state with campaign addresses
    };
    doGetMyActiveCampaigns();
  }, []);

  // Set up polling for each campaign in the list of active campaigns
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []; // Array to store interval IDs

    myActiveCampaignAddresses.forEach((myActiveCampaignAddress) => {
      let latestBlock = Number(
        localStorage.getItem(
          `donationMade_latestBlock_${myActiveCampaignAddress}`,
        ) || 0,
      ); // Get the latest processed block from localStorage

      const setupPolling = async () => {
        const polling = async () => {
          latestBlock = await pollDonationMadeEvents(
            myActiveCampaignAddress,
            latestBlock,
            setDonations,
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
  }, [myActiveCampaignAddresses]);

  return (
    <DonationMadePollingContext.Provider value={{ donations }}>
      {children}
    </DonationMadePollingContext.Provider>
  );
};
