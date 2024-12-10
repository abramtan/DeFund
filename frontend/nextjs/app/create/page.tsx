"use client";

import { useState } from "react";
import { createCampaign } from "@/app/web3/functions";
import { Button } from "../components";

const CreateCampaignPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fundingGoal, setFundingGoal] = useState<number | "">("");
  const [deadline, setDeadline] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !description || !fundingGoal || !deadline) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      console.log("Deadline being sent to createCampaign (seconds):", deadline); // Debug log
      setIsSubmitting(true);
      await createCampaign(name, description, fundingGoal, deadline!);
      alert("Campaign created successfully!");
      setName("");
      setDescription("");
      setFundingGoal("");
      setDeadline(null);
    } catch (error) {
      alert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="bg-indigo-700 rounded-lg shadow-xl overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white sm:text-4xl">
                  Start a New Campaign
                </h1>
                <p className="mt-1 text-lg sm:text-xl text-indigo-200">
                  Share your story and raise funds for your cause.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Campaign Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe your campaign"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="fundingGoal"
                  className="block text-sm font-medium text-gray-700"
                >
                  Funding Goal (ETH)
                </label>
                <input
                  id="fundingGoal"
                  type="number"
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter funding goal in ETH"
                  min={0.00001}
                  step={0.00001}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-700"
                >
                  Deadline
                </label>
                <input
                  id="deadline"
                  type="datetime-local"
                  value={
                    deadline === null
                      ? ""
                      : new Date(deadline * 1000) // Convert Unix timestamp to JavaScript Date
                          .toLocaleString("sv-SE", {
                            timeZone: "Asia/Singapore",
                            hour12: false,
                          }) // Convert to Singapore Time (SGT)
                          .replace(" ", "T") // Replace space with "T" to match the input format
                          .slice(0, 16) // Keep only "YYYY-MM-DDTHH:MM" format
                  }
                  onChange={(e) => {
                    const localDateTime = new Date(e.target.value); // Get the local time the user entered
                    console.log("Raw input value (local time):", localDateTime);

                    const deadlineTimestampInSeconds = Math.floor(
                      localDateTime.getTime() / 1000,
                    ); // Convert to Unix timestamp (in seconds)
                    setDeadline(deadlineTimestampInSeconds); // Store the deadline in seconds (Unix timestamp)
                    console.log(
                      "Set deadline in seconds is: ",
                      deadlineTimestampInSeconds,
                    ); // Log the timestamp
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter funding deadline in mm/dd/yyyy"
                  required
                />
              </div>

              <div className="text-right">
                <Button
                  type="submit"
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCampaignPage;
