"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, DeFundLogo } from "./index";
import WalletButton from "./WalletButton";

const Header: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Explore", href: "/explore" },
    { name: "Create Campaign", href: "/create" },
    { name: "My Campaigns", href: "/mycampaigns" },
    { name: "How To Use", href: "/howtouse" },
  ];

  const [account, setAccount] = useState<string | null>(null);

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
            <Link href="/" className="flex">
              <DeFundLogo />
              <span className="ml-2 text-2xl font-bold text-indigo-600">
                DeFund
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <WalletButton account={account} setAccount={setAccount} />
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
