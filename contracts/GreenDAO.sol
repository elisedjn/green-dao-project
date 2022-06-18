//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract GreenDAO {
    using SafeERC20 for IERC20;
    uint256 public constant ROUND_DURATION = 14 days;
    uint256 public constant PROPOSAL_DURATION = 10 days;

    address owner;
    uint256 public start;
    address immutable token;
    uint256 public immutable pricePerVote;

    struct Member {
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

    mapping(address => Member) public members;
    mapping(uint256 => mapping(address => Project)) public projects; //first uint256 is the roundId

    mapping(uint256 => address[]) public projectsPerRound;

    //Round
    enum RoundStatus {
        Propose,
        Vote
    }
    struct Round {
        bool hasBeenPaid;
        uint256 moneyCollected;
        address[] winningProjects;
        uint256 balance;
    }
    mapping(uint256 => Round) public rounds;

    //DAO Info
    uint256 public totalCollected;
    uint256 public totalProjects;
    address[] public activeMembers;
    uint256 public anonymousDonors;

    constructor(address _token, uint256 _pricePerVote) {
        owner = msg.sender;
        start = block.timestamp;
        token = _token;
        require(
            pricePerVote > 10**IERC20(_token).decimals(),
            "Price per vote too low"
        );
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

    function payMembership(uint256 amount) public {
        // Check roundStatus == Propose
        // Check that the minimum fee is reached
        SafeERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        // Add a member to the members map
    }

    function addProject(Project project) external {
        // Check roundStatus == Propose
        // Check msg.sender is a Member (using isMember)
        // Check that the member has paid for the current round ??
        // Check that project.addr is not already associated to an existing project for this round
        // Add the project to the projects maps and projectPerRound map
    }

    function acceptDonation(uint256 amount) external {
        // Merge with paymembership ?
        // Check if msg.sender is a member. If so, add new votes if the fee per vote is reached
        // Should the msg.sender be automatically added as a member if his donation > membership fee ?
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
        require(
            !rounds[roundId].hasBeenPaid,
            "Donation already done for this round"
        );
        rounds[roundId].hasBeenPaid = true;
        uint256[] winners = findWinners(roundId);

        //Get the number of votes for all the winner projects
        uint256 totalVotesForWinners;
        for (uint256 i = 0; i < winners.length; i++) {
            address project = winners[i];
            uint256 votes = projects[roundId][project].votes;
            totalVotesForWinners += votes;
        }

        //Send the transactions
        for (uint256 i = 0; i < winners.length; i++) {
            address project = winners[i];
            uint256 votes = projects[roundId][project].votes;
            uint256 amount = rounds[roundId].balance *
                (votes / totalVotesForWinners);
            SafeERC20(token).safeTransferFrom(address(this), project, amount);
        }
    }

    function findWinners(uint256 roundId) internal returns (address[] memory) {
        uint256 firstVotes;
        uint256 nbOfFirst;
        uint256 secondVotes;
        uint256 nbOfSecond;
        uint256 thirdVotes;
        uint256 nbOfThird;
        for (uint256 i = 0; i < projectsPerRound[roundId].length; i++) {
            address projectAddr = projectsPerRound[roundId][i];
            uint256 votes = projects[roundId][projectAddr].votes;
            if (votes == firstVotes) {
                //Tie for first position
                nbOfFirst++;
            } else if (votes > firstVotes) {
                // A new first is found!
                // second become third
                thirdVote = secondVote;
                nbOfThird = nbOfSecond;
                //first become second
                secondVote = firstVote;
                nbOfSecond = nbOfFirst;
                // new first setup
                firstVotes = votes;
                nbOfFirst = 1;
            } else if (votes == secondVotes) {
                // Tie for second position
                nbOfSecond++;
            } else if (votes > secondVotes) {
                // A new second is found!
                // second become third
                thirdVote = secondVote;
                nbOfThird = nbOfSecond;
                //new second setup
                secondVotes = votes;
                nbOfSecond = 1;
            } else if (votes == thirdVotes) {
                //Tie for third
                thirdVotes++;
            } else if (votes > thirdVotes) {
                //A new third is found!
                thirdVotes = votes;
                nbOfThird = 1;
            }
        }

        address[] memory firstOnes = new address[](nbOfFirst);
        uint256 indexFirst;
        address[] memory secondOnes = new address[](nbOfSecond);
        uint256 indexSecond;
        address[] memory thirdOnes = new address[](nbOfThird);
        uint256 indexThird;
        for (uint256 i = 0; i < projectsPerRound[roundId].length; i++) {
            address projectAddr = projectsPerRound[roundId][i];
            uint256 votes = projects[roundId][projectAddr].votes;
            if (votes == firstVotes) {
                firstOnes[indexFirst] = projectAddr;
                indexFirst++;
            } else if (votes == secondVotes) {
                secondOnes[indexSecond] = projectAddr;
                indexSecond++;
            } else if (votes == thirdVotes) {
                thirdOnes[indexThird] = projectAddr;
                indexThird++;
            }
        }

        address[] memory allWinnersSorted = new address[](
            nbOfFirst + nbOfSecond + nbOfThird
        );
        for (uint256 i = 0; i < nbOfFirst; i++) {
            allWinnersSorted.push(firstOnes[i]);
        }
        for (uint256 i = 0; i < nbOfSecond; i++) {
            allWinnersSorted.push(secondOnes[i]);
        }
        for (uint256 i = 0; i < nbOfThird; i++) {
            allWinnersSorted.push(thirdOnes[i]);
        }

        return allWinnersSorted;
    }

    function isMember(address user) public view returns (bool) {
        // check if user is part of the members
    }

    function hasPaidForCurrentRound(address user) public view returns (bool) {
        // check if user has paid for the current round
    }

    function getMemberRemainingVotes(address user)
        public
        view
        returns (uint256)
    {
        // returns the remaining votes of that user (check that the user is a member before)
    }

    function getMembersLastVotes(address user) public view returns (uint256[]) {
        // check that the user is a member before to proceed
        // returns the projects the user has voted for (so we can show on front-end on the current projects if the user has already voted on some of them)
    }

    function getLastWinners() public view returns (Project[]) {
        // returns the winners of the previous round (currentRound - 1)
    }

    function getCurrentProjects() public view returns (Project[]) {
        // returns the currentRound projects
    }

    function getRoundStatus()
        public
        view
        returns (bool voteAllowed, uint256 currentRoundTimestamp)
    {
        // returns if the vote is currently allowed (so we will be able to know at which part of the round we are) and the timestamp when the current round has started (so we can show something like 'XX days left to propose a project' or 'XX days left to vote')
    }

    function getActualBalance() public view returns (uint256) {
        uint256 balance = IERC20.balanceOf(address(this));
        return balance;
    }

    function getTotalVotesForARound(roundId) public view returns (uint256) {
        uint256 totalVotes;
        for (uint256 i = 0; i < projectsPerRound[roundId]; i++) {
            address project = projectsPerRound[roundId][i];
            totalVotes += projects[roundId][project].votes;
        }
        return totalVotes;
    }
}
