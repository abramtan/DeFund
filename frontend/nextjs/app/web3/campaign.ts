export interface Campaign {
  address: string;
  beneficiary: string;
  name: string;
  description: string;
  deadline: number;
  fundingGoal: number;
  totalFunds: number;
  isActive: boolean;
  contract: any;
}
