const chai = require('chai');
const { BigNumber } = require('ethers');
const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');
const { messagePrefix } = require('@ethersproject/hash');

chai.use(solidity);

const { expect, assert } = chai;

const pricePerVote = BigNumber.from(10).pow(18).mul(40);

describe('GreenDAO', function () {
    let contract;
    let accounts;
    let tokenAddress;
    before(async () => {
        //Creating a fake token for the test
        const Token = await ethers.getContractFactory('TestingToken');
        const token = await Token.deploy();
        await token.deployed();
        tokenAddress = token.address;
        console.log('token deployed', token.address);

        owner = ethers.provider.getSigner(0);
        member1 = ethers.provider.getSigner(1);
        member2 = ethers.provider.getSigner(2);
        nonmember = ethers.provider.getSigner(3);

        accounts = await ethers.provider.listAccounts();
        const GreenDAO = await ethers.getContractFactory('GreenDAO');
        const greenDAO = await GreenDAO.deploy(tokenAddress, pricePerVote);
        await greenDAO.deployed();
        contract = greenDAO;
        console.log('contract deployed', greenDAO.address);
        console.log(await contract.ROUND_DURATION());
    });

    it('Should store the token address', async function () {
        assert.equal(await contract.token(), tokenAddress);
    });

    it('Should store the pricePerVote', async function () {
        expect(await contract.pricePerVote()).to.equal(pricePerVote);
    });

    // this one works!
    it('Should keep track of round number', async function () {
        expect(await contract.getCurrentRound()).to.equal(0);
    })

    // // this does not work
    // it('Should display status of current round', async function () {
    //     expect(await contract.getCurrentRoundStatus()).to.equal(RoundStatus.Propose);
    // })


    // // these test donate()
    // it('Should add donations to the balance', async function () {
    //     await contract.connect(member1).donate(40);
    //     expect(await contract.totalCollected()).to.equal(40);
    //     // our ganache signers do not own tokens other that ETH
    //     // let's talk about just accepting ETH if this gets much more complicated
    // })

    // it('Should assign correct number of votes to member', async function () {
    //     await contract.connect(member2).donate(90);
    //     expect(await contract.members[member2].votes()).to.equal(2);
    // })


    // // these test addProject()
    // it('Should propose a new project', async function () {
    //     await contract.connect(member3).addProject('new project', "0x0");
    //     expect(await contract.projects[0]["0x0"].proposedBy()).to.equal(msg.sender);
    // })

    // it('Should revert', async function () {
    //     let ex;
    //     try {
    //         await contract.connect(member3).addProject('new project', "0x0");
    //     }
    //     catch (_ex) {
    //         ex = _ex;
    //     }
    //     assert(ex, "Attempted to propose a project that is already included in this round");
    // })


    // this one works!
    it('Should return actual balance', async function () {
        expect(await contract.getActualBalance()).to.equal(0);
    })


    // tests voting logic
    it('Should subtract the used vote', async function () {
        await contract.connect(member2).addVote('0x0', 1);
        expect(await contract.getMemberRemainingVotes()).to.equal(0);
        expect(await contract.projects[getCurrentRound()][projectAddress].votes);
        // this can't be a valid way to call this data??
    })

});