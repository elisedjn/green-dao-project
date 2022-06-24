require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');
require('dotenv').config();

module.exports = {
  solidity: '0.8.4',
  networks: {
    mumbai: {
      url: process.env.MUMBAI_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
  },
};
