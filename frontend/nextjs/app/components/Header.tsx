"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, DeFundLogo } from "./index";

const Header: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Campaigns", href: "/campaigns" },
    { name: "Create Campaign", href: "/create" },
  ];

  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async (): Promise<string | null> => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        return accounts[0];
      } catch (error) {
        console.error("User denied account access");
        return null;
      }
    } else {
      alert("Please install MetaMask!");
      return null;
    }
  };

  const handleConnectWallet = async () => {
    const connectedAccount = await connectWallet();
    if (connectedAccount) {
      setAccount(connectedAccount);
      localStorage.setItem("account", connectedAccount);
    }
  };

  useEffect(() => {
    // Restore the connected account from localStorage on initial render
    const savedAccount = localStorage.getItem("account");
    if (savedAccount) setAccount(savedAccount);

    if (typeof window.ethereum !== "undefined") {
      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem("account", accounts[0]);
        } else {
          setAccount(null);
          localStorage.removeItem("account");
        }
      });
    }
  }, []);

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <DeFundLogo />
            <span className="ml-2 text-2xl font-bold text-indigo-600">
              DeFund
            </span>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="outline" onClick={handleConnectWallet}>
              {account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : "Connect Wallet"}
            </Button>
          </div>
          <div className="flex items-center sm:hidden">
            <Button variant="ghost">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open main menu</span>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
