import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("DeFund", function () {
  async function deployCampaignFactoryFixture() {
    const [owner, otherAccount] = await hre.viem.getWalletClients();
    const factory = await hre.viem.deployContract("CampaignFactory", []);
    const publicClient = await hre.viem.getPublicClient();

    return { factory, owner, otherAccount, publicClient };
  }

  async function createCampaignFixture() {
    const { factory, owner, otherAccount, publicClient } = await loadFixture(deployCampaignFactoryFixture);

    const NAME = "Test Campaign";
    const DESCRIPTION = "A test campaign for fundraising";
    const FUNDING_GOAL = 10n ** 18n; // 1 ETH in wei
    const DEADLINE = Number(BigInt((await time.latest()) + 24 * 3600)); // +1 day

    // Create a campaign
    const hash = await factory.write.createCampaign([
      NAME,
      DESCRIPTION,
      FUNDING_GOAL,
      DEADLINE,
    ]);

    return {
      factory,
      owner,
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
  
      // Interact with the newly created Campaign
      const createEvents = await factory.getEvents.CampaignCreated();
      const campaignAddress = createEvents[0].args.campaignAddress;
      const campaign = await hre.viem.getContractAt("Campaign", campaignAddress!);
      const details = await campaign.read.getCampaignDetails();
      console.log("details: ", details);
      console.log("owner: ", owner);
  
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

  })
});
