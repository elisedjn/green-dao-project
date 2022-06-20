//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

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
        uint256 lastRoundPaid;
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
        address[] winningProjects;
        uint256 balance;
    }
    mapping(uint256 => Round) public rounds;

    //DAO Info
    uint256 public totalCollected;
    uint256 public totalPaidProjects;
    mapping(address => bool) public DAOMembers;
    uint256 public anonymousDonations;

    constructor(address _token, uint256 _pricePerVote) {
        owner = msg.sender;
        start = block.timestamp;
        token = _token;
        require(
            _pricePerVote > 10**ERC20(_token).decimals(),
            "Price per vote too low"
        );
        pricePerVote = _pricePerVote;
    }

    function getCurrentRound() public view returns (uint256) {
        uint256 duration = block.timestamp - start;
        return (duration / ROUND_DURATION) + 1;
    }

    function getCurrentRoundStatus() public view returns (RoundStatus) {
        uint256 duration = block.timestamp - start;
        if (duration % ROUND_DURATION < PROPOSAL_DURATION) {
            return RoundStatus.Propose;
        }
        return RoundStatus.Vote;
    }

    function donate(uint256 amount) public returns (uint256) {
        SafeERC20.safeTransferFrom(
            IERC20(token),
            msg.sender,
            address(this),
            amount
        );
        uint256 currentRound = getCurrentRound();
        rounds[currentRound].balance += amount;
        totalCollected += amount;
        if (
            getCurrentRoundStatus() == RoundStatus.Propose &&
            amount >= pricePerVote
        ) {
            if (!isMember(msg.sender)) {
                DAOMembers[msg.sender] = true;
                members[msg.sender].lastRoundPaid = currentRound;
                members[msg.sender].votes = 0;
            }
            members[msg.sender].votes += amount / pricePerVote;

            return members[msg.sender].votes;
        }

        anonymousDonations++;
        return 0;
    }

    function addProject(string memory _data, address _proposedRecipient)
        external
    {
        require(
            getCurrentRoundStatus() == RoundStatus.Propose,
            "Proposals are closed for this round"
        );
        require(isMember(msg.sender), "Address is not a member");
        uint256 roundId = getCurrentRound();

        require(
            projects[roundId][_proposedRecipient].proposedBy == address(0),
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
            "Voting phase is not yet started"
        );
        require(isMember(msg.sender), "Address is not a member");

        // Check that the project exist for this round
        require(
            projects[getCurrentRound()][projectAddress].proposedBy ==
                address(0),
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
            "Donations for this round have already been sent"
        );
        require(roundId != getCurrentRound(), "This round is not finished yet");
        rounds[roundId].hasBeenPaid = true;
        address[] memory winners = findWinners(roundId);
        rounds[roundId].winningProjects = winners;
        totalPaidProjects += winners.length;

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
            SafeERC20.safeTransferFrom(
                IERC20(token),
                address(this),
                project,
                amount
            );
        }
    }

    // added this fx to facilitate testing
    function getCurrentVoteCount(address project)
        public
        view
        returns (uint256 votes)
    {
        uint roundId = getCurrentRound();
        return projects[roundId][project].votes;
    }


    function findWinners(uint256 roundId)
        internal
        view
        returns (address[] memory)
    {
        uint256 firstVotes;
        uint256 secondVotes;
        uint256 thirdVotes;
        for (uint256 i = 0; i < projectsPerRound[roundId].length; i++) {
            address projectAddr = projectsPerRound[roundId][i];
            uint256 votes = projects[roundId][projectAddr].votes;
            if (votes > firstVotes) {
                // A new first is found!
                // second become third
                thirdVotes = secondVotes;
                //first become second
                secondVotes = firstVotes;
                // new first setup
                firstVotes = votes;
            } else if (votes > secondVotes) {
                // A new second is found!
                // second become third
                thirdVotes = secondVotes;
                //new second setup
                secondVotes = votes;
            } else if (votes > thirdVotes) {
                //A new third is found!
                thirdVotes = votes;
            }
        }

        address[] memory firstOnes = new address[](10);
        uint256 indexFirst;
        address[] memory secondOnes = new address[](10);
        uint256 indexSecond;
        address[] memory thirdOnes = new address[](10);
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

        address[] memory allWinnersSorted = new address[](30);
        uint256 winnerIndex;
        for (uint256 i = 0; i < 10; i++) {
            allWinnersSorted[winnerIndex] = firstOnes[i];
            winnerIndex++;
        }
        for (uint256 i = 0; i < 10; i++) {
            allWinnersSorted[winnerIndex] = secondOnes[i];
            winnerIndex++;
        }
        for (uint256 i = 0; i < 10; i++) {
            allWinnersSorted[winnerIndex] = thirdOnes[i];
            winnerIndex++;
        }

        return allWinnersSorted;
    }

    function isMember(address user) public view returns (bool) {
        uint256 currentRound = getCurrentRound();
        return members[user].lastRoundPaid == currentRound;
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
        returns (address[] memory)
    {
        require(isMember(user), "Address is not a member");
        address[] memory lastVotes = members[user].hasVotedFor;
        return lastVotes;
    }

    function getLastWinners()
        public
        view
        returns (address[] memory, Project[] memory)
    {
        uint256 prevRoundId = (getCurrentRound() - 1);
        address[] memory winners = rounds[prevRoundId].winningProjects;
        Project[] memory previousWinners = new Project[](winners.length);
        for (uint256 i = 0; i < winners.length; i++) {
            previousWinners[i] = (projects[prevRoundId][winners[i]]);
        }
        return (winners, previousWinners);
    }

    function getCurrentProjects()
        public
        view
        returns (address[] memory, Project[] memory)
    {
        uint256 roundId = getCurrentRound();
        address[] memory list = projectsPerRound[roundId];
        Project[] memory currentProjects = new Project[](list.length);
        for (uint256 i = 0; i < list.length; i++) {
            currentProjects[i] = (projects[roundId][list[i]]);
        }
        return (list, currentProjects);
    }
}
