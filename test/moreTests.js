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

  it('Should add donations to the balance', async function () {
    const donation = BigNumber.from(10).pow(18).mul(40);
    await token.connect(member1).approve(contract.address, donation);
    await contract.connect(member1).donate(donation);
    expect(await contract.totalCollected()).to.equal(donation);
  });

  it('Should assign correct number of votes to member', async function () {
    const donation = BigNumber.from(10).pow(18).mul(90);
    await token.connect(member2).approve(contract.address, donation);
    await contract.connect(member2).donate(donation);
    expect(await contract.getMemberRemainingVotes(await member2.getAddress())).to.equal(
      2
    );
  });

  it('Should propose a new project', async function () {
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

  it('Should revert as it is a non member', async function () {
    const projectAddress = await project1.getAddress();
    await expect(
      contract.connect(nonmember).addProject('new project', projectAddress)
    ).to.be.revertedWith('Address is not a member');
  });

  it('Should return actual balance', async function () {
    expect(await token.balanceOf(contract.address)).to.equal(0);
  });
});
