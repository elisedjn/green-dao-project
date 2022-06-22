const chai = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');
const { evm_snapshot, evm_revert, evm_increaseTime } = require('./helpers');

chai.use(solidity);

const { expect } = chai;

const pricePerVote = BigNumber.from(10).pow(18).mul(40);
const oneWeekInSec = 7 * 24 * 3600;

describe('GreenDAO', function () {
  let contract;
  let tokenAddress;
  let token;
  let owner;
  let member1;
  let member2;
  let member3;
  let nonmember;
  let project1;
  let project2;
  let snapshot;
  before(async () => {
    //Get some addresses
    owner = ethers.provider.getSigner(0);
    member1 = ethers.provider.getSigner(1);
    member2 = ethers.provider.getSigner(2);
    member3 = ethers.provider.getSigner(10);

    nonmember = ethers.provider.getSigner(3);
    project1 = ethers.provider.getSigner(4);
    project2 = ethers.provider.getSigner(5);
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

  describe('apply voting credits', () => {


    beforeEach(async () => {
      // First member 2 donates to become a member and be able to add a project;
      const donation = BigNumber.from(10).pow(18).mul(160);
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
      expect(member.votes).to.equal(1);
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

    it('Should revert if member does not have enough votes for transaction', async function () {
      const projectAddress1 = await project1.getAddress();
      const projectAddress2 = await project2.getAddress();

      await expect (
        contract.connect(member2).voteForProject(projectAddress1, 2)
      ).to.be.revertedWith('You do not have enough votes, try voting with less');

      await contract.connect(member2).voteForProject(projectAddress2, 1);
      await expect(
        contract.connect(await member2).voteForProject(projectAddress1, 1)
      ).to.be.revertedWith('You are out of votes for this round');
    })

    it('Should provide an array of projects the member voted for', async function () {
      expect(
        (await contract.getProjectsMemberVotedFor(await member2.getAddress())).length
      ).to.equal(2);
    });
  });
});
