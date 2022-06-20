const chai = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');
const { evm_snapshot, evm_revert, evm_increaseTime } = require('./helpers');

chai.use(solidity);

const { expect, assert } = chai;

const pricePerVote = BigNumber.from(10).pow(18).mul(40);
const oneWeekInSec = 7 * 24 * 3600;

const RoundStatus = {
  Propose: 0,
  Vote: 1,
};

describe('GreenDAO', function () {
  let contract;
  let tokenAddress;
  let token;
  let owner;
  let member1;
  let member2;
  let nonmember;
  let project1;
  let snapshot;
  before(async () => {
    //Get some addresses
    owner = ethers.provider.getSigner(0);
    member1 = ethers.provider.getSigner(1);
    member2 = ethers.provider.getSigner(2);
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
    const addr3 = await nonmember.getAddress();
    const amount = BigNumber.from(10).pow(18).mul(500);
    await token.transfer(addr1, amount);
    await token.transfer(addr2, amount);
    await token.transfer(addr3, amount);

    const GreenDAO = await ethers.getContractFactory('GreenDAO');
    const greenDAO = await GreenDAO.deploy(tokenAddress, pricePerVote);
    await greenDAO.deployed();
    contract = greenDAO;
    console.log('contract deployed', greenDAO.address);
    snapshot = await evm_snapshot();
  });

  beforeEach(async () => {
    await evm_revert(snapshot);
    snapshot = await evm_snapshot();
  });

  describe('initializing the contract', () => {
    it('Should store the token address', async function () {
      assert.equal(await contract.token(), tokenAddress);
    });

    it('Should store the pricePerVote', async function () {
      expect(await contract.pricePerVote()).to.equal(pricePerVote);
    });

    it('Should keep track of round number', async function () {
      expect(await contract.getCurrentRound()).to.equal(1);
    });

    it('Should display status of current round', async function () {
      expect(await contract.getCurrentRoundStatus()).to.equal(RoundStatus.Propose);
    });
  });

  describe('handle incoming donations', () => {
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
      expect(await contract.getMemberRemainingVotes(await member2.getAddress())).to.equal(
        2
      );
    });

    it('Should record anonymous donations', async function () {
      const donation = BigNumber.from(10).pow(18).mul(20);
      await token.connect(nonmember).approve(contract.address, donation);
      await contract.connect(nonmember).donate(donation);
      expect(await contract.anonymousDonations()).to.equal(1);
      expect(await token.balanceOf(contract.address)).to.equal(donation);
    });
  });

  describe('proposal creation', () => {
    it('Should propose a new project', async function () {
      // First member 2 donate to become a member and be able to add a project;
      const donation = BigNumber.from(10).pow(18).mul(90);
      await token.connect(member2).approve(contract.address, donation);
      await contract.connect(member2).donate(donation);

      const projectAddress = await project1.getAddress();
      await contract.connect(member2).addProject('new project', projectAddress);
      const currentProjects = await contract.getCurrentProjects();
      const isInProjects = currentProjects.find(
        (project) => project.proposedBy == member2.address
      );
      expect(!!isInProjects);
    });

    // does not revert. contract allows a second member to propose an identical project,
    // or the same member to propose it twice
    it('Should revert duplicate proposal', async function () {
      const donation = BigNumber.from(10).pow(18).mul(40);
      await token.connect(member1).approve(contract.address, donation);
      await contract.connect(member1).donate(donation);

      const projectAddress = await project1.getAddress();
      await expect(
        contract.connect(member1).addProject('new project', projectAddress)
      ).to.be.revertedWith('Project has already been proposed');
    });

    it('Should revert proposal from non member ', async function () {
      const projectAddress = await project1.getAddress();
      await expect(
        contract.connect(nonmember).addProject('new project', projectAddress)
      ).to.be.revertedWith('Address is not a member');
    });
  });

  describe('apply voting credits', () => {
    beforeEach(async () => {
      // increasing block time by 3 weeks
      evm_increaseTime(oneWeekInSec * 3);
      // First member 2 donate to become a member and be able to add a project;
      const donation = BigNumber.from(10).pow(18).mul(90);
      await token.connect(member2).approve(contract.address, donation);
      await contract.connect(member2).donate(donation);
      // then add a project so there is one to vote on
      const projectAddress = await project1.getAddress();
      await contract.connect(member2).addProject('new project', projectAddress);
    });

    it('Should substract the used vote', async function () {
      // Then vote for the project
      const projectAddress = await project1.getAddress();
      await contract.connect(member2).voteForProject(projectAddress, 1);
      // member 2 should have 2 votes, use 1 for this vote, and have 1 left
      expect(await contract.getMemberRemainingVotes()).to.equal(1);
    });

    it('Should add the used votes to project vote count', async function () {
      // Then vote for the project
      const projectAddress = project1.getAddress();
      await contract.connect(member2).voteForProject(projectAddress, 2);
      // member 1 should have 2 votes, use 2 for this vote, and have 0 left
      expect(await contract.getMemberRemainingVotes()).to.equal(0);
      expect(await contract.getCurrentVoteCount(projectAddress)).to.equal(2);
    });
  });

  describe('find and fund winning projects', () => {
    // Riley add here
  });
});
