'use client';

import { useState } from 'react';
import { Header, Footer, Button } from '../components';

const CreateCampaignPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !goal) {
      alert('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    // Simulate campaign creation logic
    setTimeout(() => {
      alert('Campaign created successfully!');
      setIsSubmitting(false);
      setTitle('');
      setDescription('');
      setGoal('');
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header account={null} onConnectWallet={() => {}} />

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
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Campaign Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter campaign title"
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
                  htmlFor="goal"
                  className="block text-sm font-medium text-gray-700"
                >
                  Funding Goal (ETH)
                </label>
                <input
                  id="goal"
                  type="number"
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter funding goal in ETH"
                  min={0.01}
                  step={0.01}
                  required
                />
              </div>

              <div className="text-right">
                <Button
                  type="submit"
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateCampaignPage;
