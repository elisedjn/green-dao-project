const chai = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');
const { evm_snapshot, evm_revert, evm_increaseTime } = require('./helpers');

chai.use(solidity);

const { expect, assert } = chai;

const pricePerVote = BigNumber.from(10).pow(18).mul(40);

const RoundStatus = {
  Propose: 0,
  Vote: 1,
};

describe('Proposal Tests', function () {
  let contract;
  let tokenAddress;
  let token;
  let owner;
  let member1;
  let member2;
  let member3;
  let nonmember;
  let project1;
  let snapshot;
  before(async () => {
    //Get some addresses
    owner = ethers.provider.getSigner(0);
    member1 = ethers.provider.getSigner(1);
    member2 = ethers.provider.getSigner(2);
    member3 = ethers.provider.getSigner(10);

    nonmember = ethers.provider.getSigner(3);
    project1 = ethers.provider.getSigner(4);

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

  describe('proposal creation', () => {
    beforeEach(async () => {
      // First 2 members donate to become a member and be able to add a project;
      const donation = BigNumber.from(10).pow(18).mul(40);
      await token.connect(member2).approve(contract.address, donation);
      await contract.connect(member2).donate(donation);

      await token.connect(member1).approve(contract.address, donation);
      await contract.connect(member1).donate(donation);
    });

    it('Should propose a new project', async function () {
      const projectAddress = await project1.getAddress();
      await contract.connect(member1).addProject('new project', projectAddress);
      const [currentAddresses, currentProjects] = await contract.getCurrentProjects();
      const isInProjects = currentAddresses.includes(projectAddress);
      expect(!!isInProjects);
    });

    it('Should revert duplicate proposal', async function () {
      const projectAddress = await project1.getAddress();
      await contract.connect(member1).addProject('new project', projectAddress);
      // member 1 tries to same propose project again
      await expect(
        contract.connect(member1).addProject('new project', projectAddress)
      ).to.be.revertedWith('This project has already been submitted');
      // member 2 tries to propose project already created by member1
      await expect(
        contract.connect(member2).addProject('new project', projectAddress)
      ).to.be.revertedWith('This project has already been submitted');
    });

    it('Should revert proposal from non member ', async function () {
      const projectAddress = await project1.getAddress();
      await expect(
        contract.connect(nonmember).addProject('new project', projectAddress)
      ).to.be.revertedWith('Address is not a member');
    });
  });
});
