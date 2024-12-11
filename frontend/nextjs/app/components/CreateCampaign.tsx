import { useState } from "react";
import { createCampaign } from "../web3/functions";
import Button from "./Button";
import Notification from "./Notification";

const CreateCampaign = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fundingGoal, setFundingGoal] = useState<number | "">("");
  const [deadline, setDeadline] = useState<number | null>(null); // In seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string>(""); // Store the message text

  const handleSubmit = async () => {
    if (!name || !description || !fundingGoal || !deadline) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      if (deadline <= new Date().getTime() / 1000) {
        throw new Error(
          "The deadline has passed! Please set one that is in the future.",
        );
      }

      console.log("Deadline being sent to createCampaign (seconds):", deadline); // Debug log
      setIsSubmitting(true);
      await createCampaign(name, description, fundingGoal, deadline!);
      // Open the notification with a success message
      setNotificationMessage("Campaign created successfully!");
      setIsNotificationOpen(true);
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
            min={new Date().toISOString().slice(0, -8)}
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
      {/* Notification Component */}
      <Notification
        isOpen={isNotificationOpen}
        message={notificationMessage}
        onClose={() => setIsNotificationOpen(false)} // Close the notification
      />
    </div>
  );
};

export default CreateCampaign;
