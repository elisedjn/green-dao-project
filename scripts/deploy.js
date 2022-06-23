const { BigNumber } = require('ethers');
const hre = require('hardhat');
const fs = require('fs');

async function main() {
  const USDCMumbaiAddress = '';
  const pricePerVote = BigNumber.from(10).pow(18).mul(40);
  const GreenDAO = await ethers.getContractFactory('GreenDAO');
  const greenDAO = await GreenDAO.deploy(USDCMumbaiAddress, pricePerVote);

  await greenDAO.deployed();

  console.log('GreenDAO deployed to:', greenDAO.address);
  const config = { address: greenDAO.address };
  fs.writeFileSync('./app/__config.json', JSON.stringify(config, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
