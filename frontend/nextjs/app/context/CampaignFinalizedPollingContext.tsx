"use client";

import React, { createContext, useEffect, useState } from "react";
import { pollCampaignFinalizedEvents } from "../web3/functions";
import { EVENT_POLLING_INTERVAL } from "../web3/const";
import { toast } from "react-hot-toast";
import { getInactiveCampaigns } from "../web3/functions"; // Import the new function

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
    const doGetInactiveCampaigns = async () => {
      const inactiveCampaigns = await getInactiveCampaigns(); // Fetch inactive campaigns
      const addresses = inactiveCampaigns.map(
        (inactiveCampaign) => inactiveCampaign.address,
      );
      setInactiveCampaignAddress(addresses);
    };
    doGetInactiveCampaigns();
  }, []);

  // Set up polling for each campaign in the list of inactive campaigns
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []; // Array to sore interval IDs

    inactiveCampaignAddresses.forEach((inactiveCampaignAddress) => {
      let latestBlock = Number(
        localStorage.getItem(`campaignFinalized_latestBlock_${inactiveCampaignAddress}`) || 0,
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

  // // Poll for CampaignFinalized events at regular intervals
  // useEffect(() => {
  //   const intervals: NodeJS.Timeout[] = []; // Array to store interval IDs

  //   const setupPolling = async () => {
  //     const inactiveCampaignAddresses = await getInactiveCampaigns(); // Fetch dynamic inactive campaigns

  //     inactiveCampaignAddresses.forEach((campaignAddress) => {
  //       let latestBlock = Number(
  //         localStorage.getItem(`latestBlock_${campaignAddress}`) || 0,
  //       ); // Get latest processed block

  //       const polling = async () => {
  //         latestBlock = await pollCampaignFinalizedEvents(
  //           campaignAddress.address, // Use the address of the inactive campaign
  //           latestBlock,
  //           setCampaignFinalized,
  //         );
  //       };

  //       polling(); // Trigger an immediate poll
  //       const interval = setInterval(polling, EVENT_POLLING_INTERVAL); // Poll every 10 seconds (you can adjust this)
  //       intervals.push(interval); // Store the interval ID for cleanup
  //     });
  //   };

  //   setupPolling(); // Start polling for finalized campaigns

  //   return () => {
  //     intervals.forEach((interval) => clearInterval(interval)); // Clean up intervals on unmount
  //   };
  // }, []); // Ensure the effect runs once when the component mounts

  return (
    <CampaignFinalizedContext.Provider value={{ campaignFinalized }}>
      {children}
    </CampaignFinalizedContext.Provider>
  );
};
