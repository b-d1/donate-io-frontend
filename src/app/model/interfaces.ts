export interface IUserSS {
  name: string;
  email: string;
  id: number;
  hash: string;
}

export interface IType {
  type: string;
}

export interface IGasPrice {
  gasPrice: number;
}

export interface IUserDB {
  mnemonic: string;
  ethereum: IEthereum;
  addresses: IAddressBalance[];
}

export interface IEthereum {
  addressIndex: number;
  derivationPath: string;
}

export interface IAddressBalance {
  address: string;
  balance: number;
  balanceUSD: number;
}

export interface IDonationCampaign {
  address: string;
  description: string;
  email: string;
  image?: any;
  fileName?: string;
  name: string;
  website?: string;
  institutionId?: number;
  timeGoal?: any;
  fundingGoal?: number;
  txid?: string;
}

export class IInstitution {
  name: string;
  description?: string;
  thumbnail?: string;
  photo?: string;
  website?: string;
  address?: string;
  email: string;
  hash?: string;
  numDonations?: number;
  totalCollected?: number;
  id:  number;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  hash?: string;
  numDontaions?: number;
  donationPoints?: number;
}

export interface IKeyPair {
  address: string;
  privateKey: any; // buffer
  privateKeyString: string;
}
