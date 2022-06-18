//SPDX-License-Identifier: Unlicense
// pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GreenDAO {
    using SafeERC20 for IERC20;
    uint256 public constant ROUND_DURATION = 4 weeks;
    uint256 public constant PROPOSAL_DURATION = 3 weeks;

    address owner;
    uint256 public start;
    address public immutable token;
    uint256 public immutable pricePerVote;

    struct Member {
        uint256 votes;
        uint256[] roundsPaid;
        address[] hasVotedFor;
    }
    struct Project {
        string data;
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
            pricePerVote > 10**ERC20(_token).decimals(),
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

    function payMembership(uint256 amount) public returns (uint256) {
        SafeERC20.safeTransferFrom(token, msg.sender, address(this), amount);
        rounds[getCurrentRound()].balance += amount;
        totalCollected += amount;
        if (
            getCurrentRoundStatus() == RoundStatus.Propose &&
            amount >= pricePerVote
        ) {
            if (!isMember(msg.sender)) {
                activeMembers.push(msg.sender);
                //Create a new Member
                members[msg.sender].roundsPaid.push(getCurrentRound());
            }
            members[msg.sender].votes += amount / pricePerVote;

            return members[msg.sender].votes;
        }

        anonymousDonors++;
        return 0;
    }

    function addProject(
        string memory _data,
        address _proposedRecipient,
        address _proposedBy
    ) external {
        require(
            getCurrentRoundStatus() == RoundStatus.Propose,
            "Proposal are not open currently"
        );
        require(isMember(msg.sender), "Address is not a member");
        uint256 roundId = getCurrentRound();
        require(
            projects[roundId][_proposedRecipient].proposedBy != 0x00,
            "This project has already been submited"
        );

        Project memory project;
        project.data = _data;
        project.proposedBy = msg.sender;

        projects[roundId][_proposedRecipient] = project;
        projectsPerRound[roundId].push(_proposedRecipient);
    }

    function voteForProject(address projectAddress, uint256 nbOfVote) external {
        require(
            getCurrentRoundStatus() == RoundStatus.Vote,
            "Votes are not currently opened"
        );
        require(isMember(msg.sender), "Address is not a member");

        // Check that the project exist for this round
        require(
            projects[getCurrentRound()][projectAddress].proposedBy != 0x00,
            "This project is not part of the current round"
        );

        members[msg.sender].votes -= nbOfVote;
        members[msg.sender].hasVotedFor[
            members[msg.sender].hasVotedFor.length
        ] = projectAddress;
        projects[getCurrentRound()][projectAddress].votes += nbOfVote;
    }

    function distributeToProjects() external {
        // will be called by Gelato every 4 weeks
        distributeToProjects(getCurrentRound() - 1);
    }

    function distributeToProjects(uint256 roundId) public {
        require(
            !rounds[roundId].hasBeenPaid,
            "Donation already done for this round"
        );
        require(roundId != getCurrentRound(), "This round is not finished yet");
        rounds[roundId].hasBeenPaid = true;
        address[] memory winners = findWinners(roundId);
        rounds[roundId].winningProjects = winners;
        totalProjects += winners.length;

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
            SafeERC20.safeTransferFrom(token, address(this), project, amount);
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
                thirdVotes = secondVotes;
                nbOfThird = nbOfSecond;
                //first become second
                secondVotes = firstVotes;
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
                thirdVotes = secondVotes;
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
        bool hasPaidForCurrentRound;
        uint256 currentRound = getCurrentRound();
        bool answer;
        for (uint256 i = 0; i < members[user].roundsPaid.length; i++) {
            if (members[user].roundsPaid[i] == currentRound) {
                hasPaidForCurrentRound = true;
            }
        }
        return hasPaidForCurrentRound;
    }

    function getMemberRemainingVotes(address user)
        public
        view
        returns (uint256)
    {
        require(isMember(user), "Address is not a member");
        return members[user].votes;
    }

    function getMembersLastVotes(address user)
        public
        view
        returns (uint256[] memory)
    {
        require(isMember(user), "Address is not a member");
        return members[user].hasVotedFor;
    }

    function getLastWinners() public view returns (Project[] memory) {
        // returns the winners of the previous round (currentRound - 1)
    }

    function getCurrentProjects() public view returns (Project[] memory) {
        // returns the currentRound projects
        uint256 roundId = getCurrentRound();
        // WARNING : This will return only an array of addresses, we need to return an array of Projects
        return projectsPerRound[roundId];
    }

    function getActualBalance() public view returns (uint256) {
        uint256 balance = IERC20.balanceOf(address(this));
        return balance;
    }

    //Maybe this is useless
    function getTotalVotesForARound(uint256 roundId)
        public
        view
        returns (uint256)
    {
        uint256 totalVotes;
        for (uint256 i = 0; i < projectsPerRound[roundId]; i++) {
            address project = projectsPerRound[roundId][i];
            totalVotes += projects[roundId][project].votes;
        }
        return totalVotes;
    }
}
