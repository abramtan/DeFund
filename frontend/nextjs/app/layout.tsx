import { Toaster } from "react-hot-toast";
import { Footer, Header } from "./components";
import "./globals.css";

import { GeistSans } from "geist/font/sans";
import { DonationMadePollingProvider } from "./context/DonationMadePollingContext";
import { CampaignFinalizedPollingProvider } from "./context/CampaignFinalizedPollingContext";

let title = "DeFund: Decentralized Crowdfunding";
let description = "The decentralized crowdfunding platform.";

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
            <Header />
            <Toaster
              position="bottom-right"
              toastOptions={{ duration: 2000 }}
            />
            {children}
            <Footer />
          </CampaignFinalizedPollingProvider>
        </DonationMadePollingProvider>
      </body>
    </html>
  );
}
