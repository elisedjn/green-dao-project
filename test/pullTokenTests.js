const chai = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');
const { evm_snapshot, evm_revert, evm_increaseTime } = require('./helpers');

chai.use(solidity);

const { expect } = chai;

const pricePerVote = BigNumber.from(10).pow(18).mul(40);
const oneWeekInSec = 7 * 24 * 3600;

describe('Pull Token Tests', function () {
  let contract;
  let tokenAddress1;
  let token1;
  let tokenAddress2;
  let token2;
  let owner;
  let member1;
  let member2;
  let member3;

  let snapshot;
  before(async () => {
    //Get some addresses
    owner = ethers.provider.getSigner(0);
    member1 = ethers.provider.getSigner(1);
    member2 = ethers.provider.getSigner(2);
    member3 = ethers.provider.getSigner(10);

    //Creating a fake token1 for the test
    const Token1 = await ethers.getContractFactory('TestingToken');
    token1 = await Token1.deploy();
    await token1.deployed();
    tokenAddress1 = token1.address;
    console.log('token 1 deployed', token1.address);
    // The owner now have 1 000 000 token1
    const balance1 = await token1.balanceOf(await owner.getAddress());
    console.log('owner balance', balance1);

    // Giving 500 token1 to the other addresses
    const addr1 = await member1.getAddress();
    const addr2 = await member2.getAddress();
    const addr3 = await member3.getAddress();
    const amount1 = BigNumber.from(10).pow(18).mul(500);
    await token1.transfer(addr1, amount1);
    await token1.transfer(addr2, amount1);
    await token1.transfer(addr3, amount1);

    //Creating a fake token2 for the test
    const Token2 = await ethers.getContractFactory('TestingToken');
    token2 = await Token2.deploy();
    await token2.deployed();
    tokenAddress2 = token2.address;
    console.log('token 2 deployed', token2.address);
    // The owner now have 1 000 000 token2
    const balance2 = await token2.balanceOf(await owner.getAddress());
    console.log('owner balance', balance2);

    // Giving 500 token1 to the other addresses
    const amount2 = BigNumber.from(10).pow(18).mul(500);
    await token2.transfer(addr1, amount2);
    await token2.transfer(addr2, amount2);
    await token2.transfer(addr3, amount2);

    const GreenDAO = await ethers.getContractFactory('GreenDAO');
    const greenDAO = await GreenDAO.deploy(tokenAddress1, pricePerVote);
    await greenDAO.deployed();
    contract = greenDAO;
    console.log('contract deployed', greenDAO.address);
    snapshot = await evm_snapshot();
  });

  beforeEach(async () => {
    await evm_revert(snapshot);
    snapshot = await evm_snapshot();
  });

  it('only the owner should be able to pull tokens', async () => {
    const amount = BigNumber.from(10).pow(18).mul(100);
    await token2.connect(member1).transfer(contract.address, amount);

    await expect(contract.connect(member1).pullTokens(tokenAddress2)).to.be.revertedWith(
      'You are not authorized to call this function'
    );
  });

  it('the owner should be able to pull the tokens other than token1', async () => {
    const amount = BigNumber.from(10).pow(18).mul(100);
    await token2.connect(member1).transfer(contract.address, amount);

    const contractBalance = await token2.balanceOf(contract.address);
    const ownersBalance = await token2.balanceOf(await owner.getAddress());

    await contract.connect(owner).pullTokens(tokenAddress2);

    const contractBalance2 = await token2.balanceOf(contract.address);
    const ownersBalance2 = await token2.balanceOf(await owner.getAddress());

    expect(contractBalance).to.equal(amount);
    expect(contractBalance2).to.equal(0);
    expect(ownersBalance2).to.equal(BigNumber.from(ownersBalance).add(amount));
  });

  it('if there is no token2 transfered before', async () => {
    await contract.connect(owner).pullTokens(tokenAddress2);
  });

  it('the owner should NOT be able to pull the tokens from token1', async () => {
    const amount = BigNumber.from(10).pow(18).mul(100);
    await token1.connect(member1).transfer(contract.address, amount);

    await expect(contract.connect(owner).pullTokens(tokenAddress1)).to.be.revertedWith(
      'You can not pull that token'
    );
  });
});
