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
  let project2;
  let project3;
  let project4;
  let project5;
  let project6;
  let snapshot;
  before(async () => {
    //Get some addresses
    owner = ethers.provider.getSigner(0);
    member1 = ethers.provider.getSigner(1);
    member2 = ethers.provider.getSigner(2);
    nonmember = ethers.provider.getSigner(3);
    project1 = ethers.provider.getSigner(4);
    project2 = ethers.provider.getSigner(5);
    project3 = ethers.provider.getSigner(6);
    project4 = ethers.provider.getSigner(7);
    project5 = ethers.provider.getSigner(8);
    project6 = ethers.provider.getSigner(9);

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

  describe('apply voting credits', () => {
    beforeEach(async () => {
      // First member 2 donates to become a member and be able to add a project;
      const donation = BigNumber.from(10).pow(18).mul(120);
      await token.connect(member2).approve(contract.address, donation);
      await contract.connect(member2).donate(donation);
      // then add 2 projects so they can be voted on
      const projectAddress1 = await project1.getAddress();
      const projectAddress2 = await project2.getAddress();
      await contract.connect(member2).addProject('new project', projectAddress1);
      await contract.connect(member2).addProject('new project', projectAddress2);
      // increasing block time by 3 weeks to switch to voting phase
      await evm_increaseTime(oneWeekInSec * 3);
      // then vote for the project
      await contract.connect(member2).voteForProject(projectAddress1, 2);
      await contract.connect(member2).voteForProject(projectAddress2, 1);
    });

    it('Should subtract the used vote', async function () {
      // member 2 should have 3 votes, vote on each project and have 0 left
      const member = await contract.members(await member2.getAddress());
      console.log('MEMBER2', member);
      expect(member.votes).to.equal(0);
    });

    it('Should add the used votes to project vote count', async function () {
      // 2 projects should have collected one vote each
      const projectAddress1 = await project1.getAddress();
      const projectAddress2 = await project2.getAddress();
      const [currentAddresses, currentProjects] = await contract.getCurrentProjects();

      const projects = currentProjects.map((p, i) => ({
        ...p,
        address: currentAddresses[i],
      }));

      const p1Votes = projects.find((p) => p.address === projectAddress1).votes;
      const p2Votes = projects.find((p) => p.address === projectAddress2).votes;
      expect(p1Votes).to.equal(2);
      expect(p2Votes).to.equal(1);
    });

    it('Should provide an array of projects the member voted for', async function () {
      const projectAddress1 = await project1.getAddress();
      const projectAddress2 = await project2.getAddress();
      // votes should be reflected in member.hasVotedFor
      expect(
        (await contract.getProjectsMemberVotedFor(await member2.getAddress())).length
      ).to.equal(2);
    });
  });

  describe('find and fund winning projects', () => {
    //getCurrentProjects
    it('Should provide the correct number of projects proposed for the current round', async function () {});

    //find winners
    it('Should select winning projects by most votes recieved', async function () {
      // 1st place votes > 2nd place votes > 3rd place votes
    });
    // distribute to projects
    it('Should distribute funds to the winners of the corresponding round', async function () {
      //number and addresses of winnning projects == number/addresses of projects that recieve funds
    });
  });
});
