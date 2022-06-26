const chai = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');
const { evm_snapshot, evm_revert } = require('./helpers');

chai.use(solidity);

const { expect, assert } = chai;

const pricePerVote = BigNumber.from(10).pow(18).mul(40);

const RoundStatus = {
  Propose: 0,
  Vote: 1,
};

describe('Constructor Tests', function () {
  let contract;
  let tokenAddress;
  let token;
  let snapshot;
  before(async () => {
    //Get some addresses
    owner = ethers.provider.getSigner(0);

    //Creating a fake token for the test
    const Token = await ethers.getContractFactory('TestingToken');
    token = await Token.deploy();
    await token.deployed();
    tokenAddress = token.address;
    console.log('token deployed', token.address);

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
});
