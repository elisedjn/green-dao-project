const { expect } = require('chai');
const { ethers } = require('hardhat');

const pricePerVote = 40 * 10 ** 6;

describe('GreenDAO', function () {
  let contract;
  let accounts;
  let tokenAddress;
  before(async () => {
    //Creating a fake token for the test
    const Token = await ethers.getContractFactory('TestingToken');
    const token = await Token.deploy();
    await token.deployed();
    tokenAddress = token.address;
    console.log('token deployed', token.address);

    accounts = await ethers.provider.listAccounts();
    const GreenDAO = await ethers.getContractFactory('GreenDAO');
    const greenDAO = await GreenDAO.deploy(tokenAddress, pricePerVote);
    await greenDAO.deployed();
    console.log('contract deployed', greenDAO.address);
  });
  it('Should store the token address', async function () {
    assert.equal(contract.token(), tokenAddress);
  });
  it('Should store the pricePerVote', async function () {
    assert.equal(contract.pricePerVote(), pricePerVote);
  });
});
