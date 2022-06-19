const chai = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');

chai.use(solidity);

const { expect, assert } = chai;

const pricePerVote = BigNumber.from(10).pow(18).mul(40);

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
    contract = greenDAO;
    console.log('contract deployed', greenDAO.address);
  });
  it('Should store the token address', async function () {
    assert.equal(await contract.token(), tokenAddress);
  });
  it('Should store the pricePerVote', async function () {
    expect(await contract.pricePerVote()).to.equal(pricePerVote);
  });
});
