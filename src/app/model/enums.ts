export enum SessionStorageKeys {
  UserData = 'userData',
  UserType = 'userType'
}

export enum DBStorageKeys {
  GasPrice = 'gasPrice',
  EthereumPriceUSD = 'ethereumPriceUSD'
}

export enum UserTypes {
  User = 'user',
  Institution = 'institution'
}

export enum SocketMessages {
   GetBalance = 'getBalance',
   GetMultipleBalances = 'getMultipleBalances',
   BalanceObtained = 'balanceObtained',
   MultipleBalancesObtained = 'multipleBalancesObtained',
   GetGasPrice = 'getGasPrice',
   GasPriceObtained = 'gasPriceObtained',
   GetTransactionCount = 'getTransactionCount',
   TransactionCountObtained = 'transactionCountObtained',
   Error = 'error'
}
