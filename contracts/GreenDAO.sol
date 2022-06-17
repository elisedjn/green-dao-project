//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract GreenDAO {
    using SafeERC20 for IERC20;
    uint256 constant ROUND_DURATION = 14 days;
    uint256 constant PROPOSAL_DURATION = 10 days;

    address owner;
    uint256 start;
    address immutable token;
    uint256 immutable pricePerVote;

    struct Member {
        bool isMember;
        uint256 votes;
        uint256[] roundsPaid;
        uint256[] hasVotedFor;
    }
    struct Project {
        string data;
        address addr;
        uint256 votes;
        address proposedBy;
    }

    mapping(address => Member) members;
    mapping(uint256 => mapping(address => Project)) projects; //first uint256 is the roundId

    mapping(uint256 => address[]) projectsPerRound;

    //Round
    enum RoundStatus {
        Propose,
        Vote
    }
    struct Round {
        bool hasBeenPaid;
        uint256 moneyCollected;
        address[3] winningProjects;
    }
    mapping(uint256 => Round) rounds;

    constructor(address _token, uint256 _pricePerVote) {
        owner = msg.sender;
        start = block.timestamp;
        token = _token;
        // require(
        //     pricePerVote > 10**IERC20(_token).decimals(),
        //     "Price per vote too low"
        // );
        pricePerVote = _pricePerVote;
    }

    function getCurrentRound() public view returns (uint256) {
        uint256 duration = block.timestamp - start;
        return duration / ROUND_DURATION;
    }

    function getCurrentRoundStatus() public view returns (RoundStatus) {
        uint256 duration = block.timestamp - start;
        if (duration % ROUND_DURATION < PROPOSAL_DURATION) {
            return RoundStatus.Propose;
        }
        return RoundStatus.Vote;
    }

    // merged with payMembership()
    function donate(uint256 amount) public returns (uint256) {
        // check if round open to donation
        require(
            getCurrentRoundStatus() == RoundStatus.Propose,
            "Contributions are closed during voting phase. Please come back when the next round begins."
        );
        // transfer tokens from their address to ours
        // SafeERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        // add membership and vote count for any donation above threshold to vote
        if (amount >= pricePerVote) {
            members[msg.sender].isMember = true;
            members[msg.sender].votes += amount / pricePerVote;
            return members[msg.sender].votes;
        }
        return 0;
        // will this work to display a message to the donor, either:
        // a) thanks, you have x voting credits for this round, or
        // b) you can't vote but thanks for donating
    }

    function addProject(Project calldata project) external {
        // Check roundStatus == Propose
        // Check msg.sender is a Member (using isMember)
        // Check that the member has paid for the current round ??
        // Check that project.addr is not already associated to an existing project for this round
        // Add the project to the projects maps and projectPerRound map
    }

    function voteForProject(address projectAddress, uint256 nbOfVote) external {
        // Check msg.sender isMember
        // Check roundStatus = Vote
        // Check project is part of current round
        // Check member has paid for this round (calling hasPaidForCurrentRound) ?
        // Substract nbOfVote vote to the member
        // Add the project address to the member hasVotedFor array
        // Add nbOfVote vote to the project
    }

    function distributeToProjects() external {
        // will be called by Gelato every 15 days
        distributeToProjects(getCurrentRound() - 1);
    }

    function distributeToProjects(uint256 roundId) public {
        // Check the round has not been paid already
        // Mark round has paid
        // Find the winners of the round findWinners()
        // Loop over the winners to send the money (how should we distribute? Do we keep some funds for the DAO? How much?)
    }

    function findWinners(uint256 roundId) internal returns (address[] memory) {
        // Find the 3 current Projects the have the more votes
        // How should we deal if some projects have the same amount of votes ?
        // Put them in the rounds mapping (winningProjects)
        // returns the winner project addresses
    }

    function isMember(address user) public view returns (bool) {
        // check if user is part of the members
        return members[user].isMember;
    }

    // rename this to 'canVote'?
    function hasPaidForCurrentRound(address user) public view returns (bool) {
        // check if user has paid for the current round
        return members[user].votes >= 1;
    }

    function getMemberRemainingVotes(address user)
        public
        view
        returns (uint256)
    {
        // returns the remaining votes of that user (check that the user is a member before)
    }

    function getMembersLastVotes(address user)
        public
        view
        returns (uint256[] memory)
    {
        // check that the user is a member before to proceed
        // returns the projects the user has voted for (so we can show on front-end on the current projects if the user has already voted on some of them)
    }

    function getLastWinners() public view returns (Project[] memory) {
        // returns the winners of the previous round (currentRound - 1)
    }

    function getCurrentProjects() public view returns (Project[] memory) {
        // returns the currentRound projects
    }

    function getDAOInfo()
        external
        view
        returns (
            uint256 balance,
            uint256 members,
            uint256 projects
        )
    {
        // returns all the info we might need in the home page for the impact part
        // We could create one function per value we need and call them all in there
    }

    function getRoundStatus()
        public
        view
        returns (bool voteAllowed, uint256 currentRoundTimestamp)
    {
        // returns if the vote is currently allowed (so we will be able to know at which part of the round we are) and the timestamp when the current round has started (so we can show something like 'XX days left to propose a project' or 'XX days left to vote')
    }
}
