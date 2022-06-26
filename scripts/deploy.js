const { BigNumber } = require('ethers');
const hre = require('hardhat');

async function main() {
  const USDCMumbaiAddress = '0xe11a86849d99f524cac3e7a0ec1241828e332c62';
  const pricePerVote = BigNumber.from(10).pow(18).mul(40);
  const time = 1656285600;
  const GreenDAO = await ethers.getContractFactory('GreenDAO');
  const greenDAO = await GreenDAO.deploy(USDCMumbaiAddress, pricePerVote, time);

  await greenDAO.deployed();

  console.log('GreenDAO deployed to:', greenDAO.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
