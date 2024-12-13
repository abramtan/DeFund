import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { AbiCoder, toUtf8Bytes } from "ethers";
import { parseUnits } from "ethers";

// Utility to convert a string to bytes32
function stringToBytes32(input: string): `0x${string}` {
  if (input.length > 32) {
    throw new Error("String is too long to convert to bytes32. It must be 32 bytes or less.");
  }
  const paddedInput = toUtf8Bytes(input.padEnd(32, '\0')); // Convert to UTF-8 bytes and pad to 32 bytes
  const abiCoder = new AbiCoder();
  const hexString = abiCoder.encode(["bytes32"], [paddedInput]).slice(0, 66); // Encode as bytes32
  if (!hexString.startsWith("0x")) {
    throw new Error("Invalid hex string generated.");
  }
  return hexString as `0x${string}`; // Ensure return type matches
}

describe("DeFund", function () {
  async function deployCampaignFactoryFixture() {
    const [owner, otherAccount] = await hre.viem.getWalletClients();
    const factory = await hre.viem.deployContract("CampaignFactory", []);
    const publicClient = await hre.viem.getPublicClient();

    return { factory, owner, otherAccount, publicClient };
  }

  async function createCampaignFixture() {
    const { factory, owner, otherAccount, publicClient } = await loadFixture(deployCampaignFactoryFixture);

    const NAME = stringToBytes32("Test Campaign");
    const DESCRIPTION = stringToBytes32("A test campaign for fundraising");
    const FUNDING_GOAL = 10n ** 18n; // 1 ETH in wei
    const DEADLINE = Number(BigInt((await time.latest()) + 24 * 3600)); // +1 day

    // Create a campaign
    const hash = await factory.write.createCampaign([
      NAME,
      DESCRIPTION,
      FUNDING_GOAL,
      DEADLINE,
    ]);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: hash });
    const events = await factory.getEvents.CampaignCreated();
    const campaignAddress = events[0].args.campaignAddress;
    const campaign = await hre.viem.getContractAt("Campaign", campaignAddress!);

    return {
      campaign,
      factory,
      owner,
      otherAccount,
      publicClient,
      NAME,
      DESCRIPTION,
      FUNDING_GOAL,
      DEADLINE,
      hash,
    };
  }

  describe("Deployment", function () {
    it("Should have a valid Ethereum address", async function () {
      const { factory, owner, otherAccount, publicClient } = await loadFixture(deployCampaignFactoryFixture);
      
      // Check that the factory's address is defined and valid
      expect(factory.address).to.be.a("string");
      expect(factory.address).to.match(/^0x[a-fA-F0-9]{40}$/); // Matches a valid Ethereum address
    })
  });

  describe("Campaign Creation", function () {
    it("Should emit a CampaignCreated event upon campaign creation", async function () {
      const { 
        factory,
        owner,
        publicClient,
        NAME,
        DESCRIPTION,
        FUNDING_GOAL,
        DEADLINE,
        hash,
      } = await loadFixture(createCampaignFixture);

      const createReceipt = await publicClient.waitForTransactionReceipt({
        hash: hash,
      });

      const createEvents = await factory.getEvents.CampaignCreated();
      console.log("Gas used for create campaign: ", createReceipt.gasUsed);

      const campaignAddress = createEvents[0].args.campaignAddress;
      expect(createEvents).to.have.lengthOf(1);
      expect(createEvents[0].eventName).to.equal("CampaignCreated");
    });

    it("Should set the correct initial parameters in the newly created campaign", async function () {
      const {
        factory,
        owner,
        publicClient,
        NAME,
        DESCRIPTION,
        FUNDING_GOAL,
        DEADLINE,
        hash,
      } = await loadFixture(createCampaignFixture);

      const createReceipt = await publicClient.waitForTransactionReceipt({
        hash: hash,
      });

      console.log("Gas used for create campaign: ", createReceipt.gasUsed);
  
      // Interact with the newly created Campaign
      const createEvents = await factory.getEvents.CampaignCreated();
      const campaignAddress = createEvents[0].args.campaignAddress;
      const campaign = await hre.viem.getContractAt("Campaign", campaignAddress!);
      const details = await campaign.read.getCampaignDetails();
      // console.log("details: ", details);
      // console.log("owner: ", owner);
  
      expect(details[0].toLowerCase()).to.equal(owner.account.address.toLowerCase());
      expect(details[1]).to.equal(NAME);
      expect(details[2]).to.equal(DESCRIPTION);
      expect(details[3]).to.equal(DEADLINE);
      expect(details[4]).to.equal(FUNDING_GOAL);
      expect(details[5]).to.equal(0n);
      expect(details[6]).to.be.true;
    });
  });

  describe("Campaign Functionality", function () {
    it("Should allow donations and update total funds correctly", async function () {
      const {
        campaign,
        factory,
        owner,
        otherAccount,
        publicClient,
        NAME,
        DESCRIPTION,
        FUNDING_GOAL,
        DEADLINE,
        hash,
      } = await loadFixture(createCampaignFixture);

      // console.log("Owner address:", owner.account.address);
      // console.log("OtherAccount address:", otherAccount.account.address);

      const createReceipt = await publicClient.waitForTransactionReceipt({
        hash: hash,
      });

      console.log("Gas used for create campaign: ", createReceipt.gasUsed);
  
      // Donate 0.5 ETH
      const donationAmount = parseUnits("0.5", "ether");
      const donateTxHash = await campaign.write.donate({
        value: donationAmount,
        account: otherAccount.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: donateTxHash});
      console.log("Gas used for donation: ", receipt.gasUsed);

      const campaignDetails = await campaign.read.getCampaignDetails();
      
      // Validate total funds
      expect(campaignDetails[5]).to.equal(donationAmount);
    });

    it("Should allow multiple donations and update total funds correctly", async function () {
      const {
        campaign,
        factory,
        owner,
        otherAccount,
        publicClient,
        NAME,
        DESCRIPTION,
        FUNDING_GOAL,
        DEADLINE,
        hash,
      } = await loadFixture(createCampaignFixture);

      // First donation of 0.5 ETH
      const donation1 = parseUnits("0.5", "ether");
      const donateTxHash = await campaign.write.donate({
        value: donation1,
        account: otherAccount.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: donateTxHash});
      console.log("Gas used for donation: ", receipt.gasUsed);

      // Second donation of 0.3 ETH
      const donation2 = parseUnits("0.3", "ether");
      await campaign.write.donate({
        value: donation2,
        account: otherAccount.account.address,
      });

      // Check total funds
      const campaignDetails = await campaign.read.getCampaignDetails();
      expect(campaignDetails[5]).to.equal(donation1 + donation2);
    });

    it("Should emit DonationMade event on donation", async function () {
      const {
        campaign,
        factory,
        owner,
        otherAccount,
        publicClient,
        NAME,
        DESCRIPTION,
        FUNDING_GOAL,
        DEADLINE,
        hash,
      } = await loadFixture(createCampaignFixture);

      const donationAmount = parseUnits("0.5", "ether");
      const donateTxHash = await campaign.write.donate({
        value: donationAmount,
        account: otherAccount.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: donateTxHash});
      console.log("Gas used for donation: ", receipt.gasUsed);

      // Validate DonationMade event
      const createEvents = await campaign.getEvents.DonationMade();
      expect(createEvents).to.have.lengthOf(1);
      expect(createEvents[0].eventName).to.equal("DonationMade");
    });

    it("Should emit FundingGoalMet when the funding goal is reached", async function () {
      const {
        campaign,
        factory,
        owner,
        otherAccount,
        publicClient,
        NAME,
        DESCRIPTION,
        FUNDING_GOAL,
        DEADLINE,
        hash,
      } = await loadFixture(createCampaignFixture);

      // Donate exactly the funding goal
      await campaign.write.donate({
        value: FUNDING_GOAL,
        account: otherAccount.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: hash,
      });

      // Validate FundingGoalMet event
      const createEvents = await campaign.getEvents.FundingGoalMet();
      expect(createEvents).to.have.lengthOf(1);
      expect(createEvents[0].eventName).to.equal("FundingGoalMet");
    });

    it("Should prevent donations after the campaign deadline", async function () {
      const {
        campaign,
        factory,
        owner,
        otherAccount,
        publicClient,
        NAME,
        DESCRIPTION,
        FUNDING_GOAL,
        DEADLINE,
        hash,
      } = await loadFixture(createCampaignFixture);

      // Move time past the deadline
      await time.increaseTo(DEADLINE + 1);

      // Attempt to donate
      await expect(
        campaign.write.donate({
          value: parseUnits("0.5", "ether"),
          account: otherAccount.account.address,
        })
      ).to.be.rejectedWith("Deadline exceeded");
    });

    it("Should allow the beneficiary to finalize a successful campaign", async function () {
      const {
        campaign,
        factory,
        owner,
        otherAccount,
        publicClient,
        NAME,
        DESCRIPTION,
        FUNDING_GOAL,
        DEADLINE,
        hash,
      } = await loadFixture(createCampaignFixture);

      // Donate full funding goal
      await campaign.write.donate({
        value: FUNDING_GOAL,
        account: otherAccount.account.address,
      });

      // Finalize the campaign
      const finalizeHash = await campaign.write.finalizeCampaign({
        account: owner.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: finalizeHash});
      console.log("Gas used for finalize: ", receipt.gasUsed);

      const campaignDetails = await campaign.read.getCampaignDetails();

      // Validate the campaign is inactive
      expect(campaignDetails[6]).to.be.false;
    });

    it("Should refund donors if funding goal is not met by the deadline", async function () {
      const {
        campaign,
        factory,
        owner,
        otherAccount,
        publicClient,
        NAME,
        DESCRIPTION,
        FUNDING_GOAL,
        DEADLINE,
        hash,
      } = await loadFixture(createCampaignFixture);

      const donationAmount = parseUnits("0.5", "ether");
      await campaign.write.donate({
        value: donationAmount,
        account: otherAccount.account.address,
      });

      // Move time past the deadline
      await time.increaseTo(DEADLINE + 1);

      // Finalize the campaign
      const finalizeHash = await campaign.write.finalizeCampaign({
        account: owner.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: finalizeHash});
      console.log("Gas used for finalize: ", receipt.gasUsed);

      const createEvents = await campaign.getEvents.RefundIssued();
      // console.log("refund: ", createEvents[0].eventName);
      expect(createEvents).to.have.lengthOf(1);
      expect(createEvents[0].eventName).to.equal("RefundIssued");

      // Validate that donors received their refund
      const balanceAfter = await publicClient.getBalance({
        address: otherAccount.account.address,
      });
      expect(Number(balanceAfter)).to.be.greaterThanOrEqual(Number(donationAmount));
    });

    it("Should prevent non-beneficiaries from finalizing the campaign", async function () {
      const { campaign, otherAccount } = await loadFixture(createCampaignFixture);

      await expect(
        campaign.write.finalizeCampaign({
          account: otherAccount.account.address,
        })
      ).to.be.rejectedWith("Cannot finalize");
    });

    it("Should allow querying the list of donors", async function () {
      const { campaign, otherAccount, publicClient } = await loadFixture(createCampaignFixture);

      const donationAmount = parseUnits("0.5", "ether");
      await campaign.write.donate({
        value: donationAmount,
        account: otherAccount.account.address,
      });

      const donors = await campaign.read.getDonors();

      // console.log("donors: ", donors);

      // Validate donor list contains the donor
      const lowercaseDonors = donors.map((donor: string) => donor.toLowerCase());
      expect(lowercaseDonors).to.include(otherAccount.account.address.toLowerCase());
    });

    // Zero or negative fundingGoal
    it("Should revert if funding goal is 0", async function() {
      const { factory, owner, publicClient } = await loadFixture(deployCampaignFactoryFixture);
      const NAME = stringToBytes32("Invalid Goal");
      const DESCRIPTION = "A campaign with invalid goal";
      const FUNDING_GOAL = 0n;
      const DEADLINE = Number((await time.latest()) + 24 * 3600);
    
      await expect(factory.write.createCampaign([NAME, DESCRIPTION, FUNDING_GOAL, DEADLINE], { account: owner.account.address }))
        .to.be.rejectedWith("Funding goal must be > 0");
    });

    // Deadline in the past    
    it("Should revert if deadline is in the past", async function() {
      const { factory, owner } = await loadFixture(deployCampaignFactoryFixture);
      const NAME = stringToBytes32("Past Deadline");
      const DESCRIPTION = "A campaign with past deadline";
      const FUNDING_GOAL = parseUnits("1", "ether");
      const DEADLINE = Number((await time.latest()) - 1); // past deadline
    
      await expect(factory.write.createCampaign([NAME, DESCRIPTION, FUNDING_GOAL, DEADLINE], { account: owner.account.address }))
        .to.be.rejectedWith("Deadline passed");
    });

    // Donation by beneficiary
    it("Should revert if beneficiary tries to donate", async function() {
      const { campaign, owner } = await loadFixture(createCampaignFixture);
    
      await expect(campaign.write.donate({
        value: parseUnits("0.5", "ether"),
        account: owner.account.address, // owner is beneficiary
      })).to.be.rejectedWith("Beneficiary only");
    });

    // Donation after funding goal met but before deadline
    it("Should revert donations after funding goal is reached (but before deadline)", async function() {
      const { campaign, otherAccount, FUNDING_GOAL } = await loadFixture(createCampaignFixture);
    
      // Donate exactly the funding goal
      await campaign.write.donate({
        value: FUNDING_GOAL,
        account: otherAccount.account.address,
      });
    
      // Attempt another donation
      await expect(campaign.write.donate({
        value: parseUnits("0.1", "ether"),
        account: otherAccount.account.address,
      })).to.be.rejectedWith("Funding goal met");
    });

    // Donation after campaign is finalized
    it("Should revert if donating after the campaign is finalized", async function () {
      const { campaign, owner, otherAccount, publicClient, FUNDING_GOAL } = await loadFixture(createCampaignFixture);
    
      // Reach funding goal
      await campaign.write.donate({
        value: FUNDING_GOAL,
        account: otherAccount.account.address,
      });
    
      // Finalize campaign
      const finalizeHash = await campaign.write.finalizeCampaign({ account: owner.account.address });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: finalizeHash});
      console.log("Gas used for finalize: ", receipt.gasUsed);
    
      // Attempt to donate after finalization
      await expect(
        campaign.write.donate({
          account: owner.account.address,
          value: parseUnits("0.1", "ether"),
        })
      ).to.be.rejectedWith("Inactive Campaign");
    });

    // Finalize campaign too early
    it("Should revert if beneficiary tries to finalize before deadline and funding goal not met", async function() {
      const { campaign, owner } = await loadFixture(createCampaignFixture);
    
      // No donations, not at or past deadline
      await expect(campaign.write.finalizeCampaign({
        account: owner.account.address,
      })).to.be.rejectedWith("Cannot finalize");
    });

    // Finalize by non-beneficiary
    it("Should revert if non-beneficiary tries to finalize the campaign", async function () {
      const { campaign, owner, otherAccount, FUNDING_GOAL } = await loadFixture(createCampaignFixture);
    
      // Reach funding goal
      await campaign.write.donate({
        value: FUNDING_GOAL,
        account: otherAccount.account.address,
      });
    
      await expect(
        campaign.write.finalizeCampaign({ account: otherAccount.account.address })
      ).to.be.rejectedWith("Not beneficiary");
    });

    // Finalize twice
    it("Should revert if trying to finalize an already finalized campaign", async function() {
      const { campaign, owner, otherAccount, publicClient, FUNDING_GOAL } = await loadFixture(createCampaignFixture);
    
      // Reach funding goal
      await campaign.write.donate({
        value: FUNDING_GOAL,
        account: otherAccount.account.address,
      });
    
      // Finalize once
      const finalizeHash = await campaign.write.finalizeCampaign({ account: owner.account.address });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: finalizeHash});
      console.log("Gas used for finalize: ", receipt.gasUsed);
    
      // Try finalizing again
      await expect(campaign.write.finalizeCampaign({ account: owner.account.address }))
        .to.be.rejectedWith("Inactive Campaign");
    });

    // // Finalize campaign with zero donors
    it("Should finalize the campaign with zero donors", async function () {
      const {
        campaign,
        factory,
        owner,
        otherAccount,
        publicClient,
        NAME,
        DESCRIPTION,
        FUNDING_GOAL,
        DEADLINE,
        hash,
      } = await loadFixture(createCampaignFixture);

      // Move time past the deadline
      await time.increaseTo(DEADLINE + 1);

      // Finalize the campaign
      const finalizeHash = await campaign.write.finalizeCampaign({
        account: owner.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: finalizeHash});
      console.log("Gas used for finalize: ", receipt.gasUsed);

      const campaignDetails = await campaign.read.getCampaignDetails();

      // Validate the campaign is inactive
      expect(campaignDetails[6]).to.be.false;
    });

    // Get donors before any donations
    it("Should return an empty donor list if no donations were made", async function() {
      const { campaign } = await loadFixture(createCampaignFixture);
      const donors = await campaign.read.getDonors();
      expect(donors).to.be.empty;
    });

    // Test campaign creation with invalid parameters
    it("Should revert campaign creation with invalid parameters", async function () {
      const { factory, owner } = await loadFixture(deployCampaignFactoryFixture);
    
      // Zero funding goal
      await expect(
        factory.write.createCampaign([
          stringToBytes32("Invalid Campaign"),
          "Zero funding goal",
          0n, // Zero funding goal
          Number(await time.latest()) + 3600, // Future deadline
        ])
      ).to.be.rejectedWith("Funding goal must be > 0");
    
      // Deadline in the past
      await expect(
        factory.write.createCampaign([
          stringToBytes32("Invalid Campaign"),
          "Past deadline",
          parseUnits("1", "ether"),
          Number(await time.latest()) - 3600, // Past deadline
        ])
      ).to.be.rejectedWith("Deadline passed");
    });

    it("Should allow donations exceeding the funding goal if the goal is not yet met", async function () {
      const { campaign, otherAccount, FUNDING_GOAL } = await loadFixture(createCampaignFixture);
    
      // First donation to exceed the funding goal
      await campaign.write.donate({
        value: parseUnits("100", "ether"),
        account: otherAccount.account.address,
      });
    
      const campaignDetails = await campaign.read.getCampaignDetails();
    
      // Total funds should exceed the funding goal
      expect(campaignDetails[5]).to.equal(parseUnits("100", "ether"));
    });

    it("Should refund donors correctly when funding goal is not met", async function () {
      const { owner, campaign, otherAccount, publicClient, DEADLINE } = await loadFixture(createCampaignFixture);
    
      const donation1 = parseUnits("0.3", "ether");
      const donation2 = parseUnits("0.4", "ether");
    
      // Two donations
      await campaign.write.donate({
        value: donation1,
        account: otherAccount.account.address,
      });
      await campaign.write.donate({
        value: donation2,
        account: otherAccount.account.address,
      });
    
      // Move time past the deadline
      await time.increaseTo(DEADLINE + 1);
    
      // Finalize the campaign
      const finalizeHash = await campaign.write.finalizeCampaign({
        account: owner.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: finalizeHash});
      console.log("Gas used for finalize: ", receipt.gasUsed);
    
      // Check refunds are issued
      const refundEvents = await campaign.getEvents.RefundIssued();
      // console.log("refundEvents: ", refundEvents);
      expect(refundEvents[0].args.amount).to.equal(parseUnits("0.7", "ether"));
    });

    it("Should transfer all funds to beneficiary when the campaign is successful", async function () {
      const { campaign, owner, otherAccount, FUNDING_GOAL, publicClient } = await loadFixture(createCampaignFixture);
    
      // Donate full funding goal
      await campaign.write.donate({
        value: FUNDING_GOAL,
        account: otherAccount.account.address,
      });
    
      // Get the beneficiary's balance before finalization
      const balanceBefore = await publicClient.getBalance({ address: owner.account.address });
    
      // Finalize the campaign and retrieve the transaction receipt
      const txHash = await campaign.write.finalizeCampaign({
        account: owner.account.address,
      });
    
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      console.log("Gas used for finalize: ", receipt.gasUsed);
    
      // Calculate the actual gas cost from the receipt
      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.effectiveGasPrice;
      const actualGasCost = gasUsed * gasPrice;
    
      // Get the beneficiary's balance after finalization
      const balanceAfter = await publicClient.getBalance({ address: owner.account.address });
    
      // Validate total funds are transferred to the beneficiary, accounting for actual gas fees
      const expectedBalance = BigInt(balanceBefore) + FUNDING_GOAL - BigInt(actualGasCost);
      expect(balanceAfter).to.equal(expectedBalance);
    });
  })
});
