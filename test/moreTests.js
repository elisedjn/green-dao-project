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
    //ELISE : how does JavaScript knows what is RoundStatus.Propose ? You did not define this variable anywhere :) (I just added it on top of the file, to make it accessible everywhere)
    expect(await contract.getCurrentRoundStatus()).to.equal(RoundStatus.Propose);
  });

  // these test donate()
  it('Should add donations to the balance', async function () {
    // ELISE : Donation should be 40 * 10**18 because the token we're using has 18 decimals. As this is a BigNumber, JavaScript can't handle it, so we need to use BigNumber.from(10).pow(18).mul(40); (which means create a big number from 10 power 18 multiply by 40 <-- donation value)
    const donation = BigNumber.from(10).pow(18).mul(40);
    // we need to approve that the contract can transfer some of the member1 ERC20 to itself
    await token.connect(member1).approve(contract.address, donation);
    await contract.connect(member1).donate(donation);
    expect(await contract.totalCollected()).to.equal(donation);
    // our ganache signers do not own tokens other that ETH
    // let's talk about just accepting ETH if this gets much more complicated
    // ELISE : It will be easier to simply mint some TestingToken to the test address in the "before" part of the tests instead of implementing all the logic to accept ETH
  });

  it('Should assign correct number of votes to member', async function () {
    // ELISE : Donation should be 90 * 10**18 because the token we're using has 18 decimals. As this is a BigNumber, JavaScript can't handle it, so we need to use BigNumber.from(10).pow(18).mul(90); (which means create a big number from 10 power 18 multiply by 90 <-- donation value)
    const donation = BigNumber.from(10).pow(18).mul(90);
    // we need to approve that the contract can transfer some of the member1 ERC20 to itself
    await token.connect(member2).approve(contract.address, donation);
    await contract.connect(member2).donate(donation);
    // ELISE : You can't call the members mapping as you will do it in the smart contract, you need to call the function getMemberRemainingVotes()
    // expect(await contract.members[member2].votes()).to.equal(2);
    expect(await contract.getMemberRemainingVotes(await member2.getAddress())).to.equal(
      2
    );
  });

  // these test addProject()
  it('Should propose a new project', async function () {
    // ELISE : member3 is never define.
    // await contract.connect(member3).addProject('new project', '0x0');
    // First member 2 donate to become a member and be able to add a project;
    const donation = BigNumber.from(10).pow(18).mul(90);
    await token.connect(member2).approve(contract.address, donation);
    await contract.connect(member2).donate(donation);

    const projectAddress = await project1.getAddress();
    await contract.connect(member2).addProject('new project', projectAddress);
    // ELISE : Same here, you can't call the projects mapping like that
    // expect(await contract.projects[0]['0x0'].proposedBy()).to.equal(msg.sender);
    const currentProjects = await contract.getCurrentProjects();
    const isInProjects = currentProjects.find(
      (project) => project.proposedBy == member2.address
    );
    expect(!!isInProjects);
  });

  it('Should revert as it is a non member', async function () {
    // let ex;
    // try {
    //   // ELISE : This will revert because member3 is not a member, not because the project has already been proposed
    //   // ELISE : In fact it won't work at all before member3 variable is not defined anywhere
    //   await contract.connect(member3).addProject('new project', '0x0');
    // } catch (_ex) {
    //   ex = _ex;
    // }
    // assert(ex, 'Attempted to propose a project that is already included in this round');

    //ELISE : There is an easier way to test if it reverts, using something like this :
    const projectAddress = await project1.getAddress();
    await expect(
      contract.connect(nonmember).addProject('new project', projectAddress)
    ).to.be.revertedWith('Address is not a member');
  });

  it('Should return actual balance', async function () {
    expect(await token.balanceOf(contract.address)).to.equal(0);
  });

  //   // tests voting logic
  //   it('Should substract the used vote', async function () {
  //     // First member 2 donate to become a member and be able to add a project;
  //     const donation = BigNumber.from(10).pow(18).mul(90);
  //     await token.connect(member2).approve(contract.address, donation);
  //     await contract.connect(member2).donate(donation);

  //     // Then vote for the project
  //     const projectAddress = project1.getAddress();
  //     await contract.connect(member2).voteForProject(projectAddress, 1);
  //     expect(await contract.getMemberRemainingVotes()).to.equal(0);
  //     // expect(await contract.projects[getCurrentRound()][projectAddress].votes);
  //     // this can't be a valid way to call this data??
  //     // ELISE : No, this is not :D

  //     const currentProjects = await contract.getCurrentProjects();
  //     // ELISE : At this point I realize we need to store the project address into the Project struct to be able to havee it when calling getCurrentProjects.
  //     // const votedProject = currentProjects.find(project => )
  //   });
});
