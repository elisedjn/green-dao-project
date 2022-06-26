const chai = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');
const { evm_snapshot, evm_revert, evm_increaseTime } = require('./helpers');

chai.use(solidity);

const { expect, assert } = chai;

const pricePerVote = BigNumber.from(10).pow(18).mul(40);
const oneWeekInSec = 7 * 24 * 3600;
const oneDay = 24 * 3600;

const RoundStatus = {
  Propose: 0,
  Vote: 1,
};

const totalCollected = 0;

describe('Funds Tests', function () {
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
    member3 = ethers.provider.getSigner(10);

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

  describe('find and fund winning projects', () => {
    beforeEach(async () => {
      const donation = BigNumber.from(10).pow(18).mul(400);

      //donate to be member (1)
      await token.connect(member1).approve(contract.address, donation);
      await contract.connect(member1).donate(donation);
      //member 2
      await token.connect(member2).approve(contract.address, donation);
      await contract.connect(member2).donate(donation);
      //member 3
      await token.connect(member3).approve(contract.address, donation);
      await contract.connect(member3).donate(donation);

      // then add multiple projects to vote on
      const projectAddress1 = await project1.getAddress();
      const projectAddress2 = await project2.getAddress();
      const projectAddress3 = await project3.getAddress();
      const projectAddress4 = await project4.getAddress();
      const projectAddress5 = await project5.getAddress();

      await contract.connect(member2).addProject('new project', projectAddress1);
      await contract.connect(member2).addProject('new project', projectAddress2);
      await contract.connect(member3).addProject('new project', projectAddress3);
      await contract.connect(member1).addProject('new project', projectAddress4);
      await contract.connect(member3).addProject('new project', projectAddress5);

      // Going to vote phase
      evm_increaseTime(oneDay);
    });

    describe('check the number of members', () => {
      it('should give 3 members', async () => {
        const membersTotal = await contract.totalMembers();
        expect(membersTotal).to.equal(3);
      });
    });

    describe('find the winners correctly', () => {
      it('Should find when there are 3 winners', async function () {
        const projectAddress1 = await project1.getAddress();
        const projectAddress2 = await project2.getAddress();
        const projectAddress3 = await project3.getAddress();
        const projectAddress4 = await project4.getAddress();
        // Voting for projects
        await contract.connect(member1).voteForProject(projectAddress4, 2);
        await contract.connect(member2).voteForProject(projectAddress1, 1);
        await contract.connect(member2).voteForProject(projectAddress2, 3);
        await contract.connect(member3).voteForProject(projectAddress3, 3);
        await contract.connect(member3).voteForProject(projectAddress3, 3);

        //Going to next round
        await network.provider.send('evm_increaseTime', [oneDay]);
        await network.provider.send('evm_mine');

        await contract.distribute2Projects();
        const [winAddr, winInfo] = await contract.getLastWinners();
        expect(winAddr[0]).to.equal(projectAddress3);
        expect(winAddr[1]).to.equal(projectAddress2);
        expect(winAddr[2]).to.equal(projectAddress4);
      });

      it('Should find when there only 2 winners', async function () {
        const projectAddress2 = await project2.getAddress();
        const projectAddress3 = await project3.getAddress();
        // Voting for projects

        await contract.connect(member2).voteForProject(projectAddress2, 3);
        await contract.connect(member3).voteForProject(projectAddress3, 3);
        await contract.connect(member3).voteForProject(projectAddress3, 3);

        //Going to next round
        await network.provider.send('evm_increaseTime', [oneDay]);
        await network.provider.send('evm_mine');

        await contract.distribute2Projects();
        const [winAddr, winInfo] = await contract.getLastWinners();
        expect(winAddr.length).to.equal(2);
        expect(winAddr[0]).to.equal(projectAddress3);
        expect(winAddr[1]).to.equal(projectAddress2);
      });

      it('Should deal with a tie for first', async function () {
        const projectAddress1 = await project1.getAddress();
        const projectAddress2 = await project2.getAddress();
        const projectAddress3 = await project3.getAddress();
        const projectAddress4 = await project4.getAddress();
        // Voting for projects
        await contract.connect(member1).voteForProject(projectAddress4, 2);
        await contract.connect(member2).voteForProject(projectAddress1, 1);
        await contract.connect(member2).voteForProject(projectAddress2, 3);
        await contract.connect(member3).voteForProject(projectAddress3, 3);

        //Going to next round
        await network.provider.send('evm_increaseTime', [oneDay]);
        await network.provider.send('evm_mine');

        await contract.distribute2Projects();
        const [winAddr, winInfo] = await contract.getLastWinners();
        expect([projectAddress3, projectAddress2].includes(winAddr[0]));
        expect([projectAddress3, projectAddress2].includes(winAddr[1]));
        expect(winAddr[2]).to.equal(projectAddress4);
        expect(winAddr[3]).to.equal(projectAddress1);
      });

      it('Should deal with tie for second', async function () {
        const projectAddress1 = await project1.getAddress();
        const projectAddress2 = await project2.getAddress();
        const projectAddress3 = await project3.getAddress();
        const projectAddress4 = await project4.getAddress();
        // Voting for projects
        await contract.connect(member1).voteForProject(projectAddress4, 2);
        await contract.connect(member2).voteForProject(projectAddress1, 1);
        await contract.connect(member2).voteForProject(projectAddress2, 2);
        await contract.connect(member3).voteForProject(projectAddress3, 3);

        //Going to next round
        await network.provider.send('evm_increaseTime', [oneDay]);
        await network.provider.send('evm_mine');

        await contract.distribute2Projects();
        const [winAddr, winInfo] = await contract.getLastWinners();
        expect([projectAddress4, projectAddress2].includes(winAddr[1]));
        expect([projectAddress4, projectAddress2].includes(winAddr[2]));
        expect(winAddr[0]).to.equal(projectAddress3);
        expect(winAddr[3]).to.equal(projectAddress1);
      });

      it('Should revert when the first round has not finished', async function () {
        await expect(contract.getLastWinners()).to.be.revertedWith(
          'The first round has not ended'
        );
      });
    });

    // distribute to projects
    describe('distribute the funds properly', () => {
      it('Should distribute funds to the winners of the corresponding round', async function () {
        //number and addresses of winnning projects == number/addresses of projects that recieve funds
        const projectAddress1 = await project1.getAddress();
        const projectAddress2 = await project2.getAddress();
        const projectAddress3 = await project3.getAddress();
        const projectAddress4 = await project4.getAddress();
        // Voting for projects
        await contract.connect(member1).voteForProject(projectAddress4, 2);
        await contract.connect(member2).voteForProject(projectAddress1, 1);
        await contract.connect(member2).voteForProject(projectAddress2, 3);
        await contract.connect(member3).voteForProject(projectAddress3, 3);
        await contract.connect(member3).voteForProject(projectAddress3, 3);

        //Going to next round
        await network.provider.send('evm_increaseTime', [oneDay]);
        await network.provider.send('evm_mine');

        await contract.distribute2Projects();
        const [winAddr, winInfo] = await contract.getLastWinners();
        expect([winAddr].includes([projectAddress2, projectAddress3, projectAddress4]));
        expect(await token.balanceOf(projectAddress2)).to.be.gt(0);
        // console.log("winning addr", winAddr, "proj info", winInfo);
        // console.log("maybe shows total", totalCollected);
      });

      it('Should distribute funds to 5 projects if there is a tie', async function () {
        //number and addresses of winnning projects == number/addresses of projects that recieve funds
        const projectAddress1 = await project1.getAddress();
        const projectAddress2 = await project2.getAddress();
        const projectAddress3 = await project3.getAddress();
        const projectAddress4 = await project4.getAddress();
        const projectAddress5 = await project5.getAddress();

        // Voting for projects
        await contract.connect(member1).voteForProject(projectAddress4, 1);
        await contract.connect(member2).voteForProject(projectAddress1, 1);
        await contract.connect(member2).voteForProject(projectAddress2, 1);
        await contract.connect(member3).voteForProject(projectAddress5, 1);
        await contract.connect(member3).voteForProject(projectAddress3, 1);

        // Going to next round
        await network.provider.send('evm_increaseTime', [oneDay]);
        await network.provider.send('evm_mine');

        await contract.distribute2Projects();
        const [winAddr, winInfo] = await contract.getLastWinners();
        expect(winAddr.length).to.equal(5);
      });

      it('Should revert if funds were already distributed for the round', async function () {
        //number and addresses of winnning projects == number/addresses of projects that recieve funds
        const projectAddress1 = await project1.getAddress();
        const projectAddress2 = await project2.getAddress();

        // Voting for projects
        await contract.connect(member2).voteForProject(projectAddress1, 1);
        await contract.connect(member2).voteForProject(projectAddress2, 1);

        // Going to next round
        await network.provider.send('evm_increaseTime', [oneDay]);
        await network.provider.send('evm_mine');
        await contract.distribute2Projects();

        await expect(contract.distribute2Projects()).to.be.revertedWith(
          'Donations for this round have already been sent'
        );
      });

      it('Should revert when the round is not over', async function () {
        await expect(contract.distribute2Projects()).to.be.revertedWith(
          'This round is not finished yet'
        );
      });
    });
  });

  it('Should revert if no projects were proposed', async function () {
    await network.provider.send('evm_increaseTime', [oneDay * 2]);
    await network.provider.send('evm_mine');
    await expect(contract.distribute2Projects()).to.be.revertedWith(
      'There are no projects to distribute this round'
    );
  });
});
