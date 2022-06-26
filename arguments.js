const { BigNumber } = require('ethers');

const USDCMumbaiAddress = '0xe11a86849d99f524cac3e7a0ec1241828e332c62';
const pricePerVote = BigNumber.from(10).pow(18).mul(40);
const time = 1656285600;
module.exports = [USDCMumbaiAddress, pricePerVote, time];
