import { Footer, Header } from "./components";
import "./globals.css";

import { GeistSans } from "geist/font/sans";
import { Toaster } from "react-hot-toast";
import { CampaignFinalizedPollingProvider } from "./context/CampaignFinalizedPollingContext";
import { DonationMadePollingProvider } from "./context/DonationMadePollingContext";
import { FundingGoalMetPollingProvider } from "./context/FundingGoalMetPollingContext";
import { RefundIssuedPollingProvider } from "./context/RefundIssuedPollingContext";

let title = "DeFund: Decentralized Crowdfunding";
let description = "The decentralized crowdfunding platform.";
const toastDuration = 5000; // In milliseconds

export const metadata = {
  title,
  description,
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  metadataBase: new URL("https://nextjs-postgres-auth.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.variable}>
        <DonationMadePollingProvider>
          <CampaignFinalizedPollingProvider>
            <FundingGoalMetPollingProvider>
              <RefundIssuedPollingProvider>
                <Header />
                <Toaster
                  position="bottom-right"
                  toastOptions={{ duration: toastDuration }}
                />
                {children}
                <Footer />
              </RefundIssuedPollingProvider>
            </FundingGoalMetPollingProvider>
          </CampaignFinalizedPollingProvider>
        </DonationMadePollingProvider>
      </body>
    </html>
  );
}
