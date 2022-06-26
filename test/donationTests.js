const chai = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');
const { evm_snapshot, evm_revert, evm_increaseTime } = require('./helpers');

chai.use(solidity);

const { expect } = chai;

const pricePerVote = BigNumber.from(10).pow(18).mul(40);

describe('Donation Tests', function () {
  let contract;
  let tokenAddress;
  let token;
  let owner;
  let member1;
  let member2;
  let member3;
  let nonmember;
  let snapshot;
  before(async () => {
    //Get some addresses
    owner = ethers.provider.getSigner(0);
    member1 = ethers.provider.getSigner(1);
    member2 = ethers.provider.getSigner(2);
    member3 = ethers.provider.getSigner(10);

    nonmember = ethers.provider.getSigner(3);

    //Creating a fake token for the test
    const Token = await ethers.getContractFactory('TestingToken');
    token = await Token.deploy();
    await token.deployed();
    tokenAddress = token.address;
    console.log('token deployed', token.address);
    // The owner now have 1 000 000 tokens
    const balance = await token.balanceOf(await owner.getAddress());
    console.log('owner balance', balance);

    // Giving 500 tokens to the other addresses
    const addr1 = await member1.getAddress();
    const addr2 = await member2.getAddress();
    const addr3 = await member3.getAddress();
    const addr4 = await nonmember.getAddress();
    const amount = BigNumber.from(10).pow(18).mul(500);
    await token.transfer(addr1, amount);
    await token.transfer(addr2, amount);
    await token.transfer(addr3, amount);
    await token.transfer(addr4, amount);

    const GreenDAO = await ethers.getContractFactory('GreenDAO');
    const block = await ethers.provider.getBlock();
    const greenDAO = await GreenDAO.deploy(tokenAddress, pricePerVote, block.timestamp);
    await greenDAO.deployed();
    contract = greenDAO;
    console.log('contract deployed', greenDAO.address);
    snapshot = await evm_snapshot();
  });

  beforeEach(async () => {
    await evm_revert(snapshot);
    snapshot = await evm_snapshot();
  });

  describe('incoming donations', () => {
    it('Should add donation value', async function () {
      const donation = BigNumber.from(10).pow(18).mul(40);
      await token.connect(member1).approve(contract.address, donation);
      await contract.connect(member1).donate(donation);
      expect(await contract.totalCollected()).to.equal(donation);
      expect(await token.balanceOf(contract.address)).to.equal(donation);
    });

    it('Should assign correct number of votes to member', async function () {
      const donation = BigNumber.from(10).pow(18).mul(90);
      await token.connect(member2).approve(contract.address, donation);
      await contract.connect(member2).donate(donation);
      expect((await contract.members(await member2.getAddress())).votes).to.equal(2);
    });

    it('Should record anonymous donations', async function () {
      const donation = BigNumber.from(10).pow(18).mul(20);
      await token.connect(nonmember).approve(contract.address, donation);
      await contract.connect(nonmember).donate(donation);
      expect(await contract.anonymousDonations()).to.equal(1);
      expect(await token.balanceOf(contract.address)).to.equal(donation);
    });

    it('Should increase the number of votes if a member gives a second time', async () => {
      const donation = BigNumber.from(10).pow(18).mul(40);
      await token.connect(member1).approve(contract.address, donation);
      await contract.connect(member1).donate(donation);
      const addr1 = await member1.getAddress();
      const [votes1, lastRoundPaid1] = await contract.members(addr1);
      // The same user send 80 USDC
      const donation2 = BigNumber.from(10).pow(18).mul(80);
      await token.connect(member1).approve(contract.address, donation2);
      await contract.connect(member1).donate(donation2);
      const [votes2, lastRoundPaid2] = await contract.members(addr1);
      expect(votes2).to.equal(3);
    });
  });
});
