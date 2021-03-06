//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

contract GreenDAO is KeeperCompatibleInterface {
    using SafeERC20 for IERC20;
    uint256 public constant ROUND_DURATION = 12 hours;
    uint256 public constant PROPOSAL_DURATION = 6 hours;

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
    uint256 public totalMembers;
    uint256 public anonymousDonations;

    constructor(
        address _token,
        uint256 _pricePerVote,
        uint256 _start
    ) {
        owner = msg.sender;
        start = _start;
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

    // For ChainlinkKeeper
    function checkUpkeep(bytes calldata checkData)
        external
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint256 previousRound = getCurrentRound() - 1;
        upkeepNeeded = !rounds[previousRound].hasBeenPaid;
    }

    function performUpkeep(bytes calldata performData) external override {
        //We highly recommend revalidating the upkeep in the performUpkeep function
        uint256 previousRound = getCurrentRound() - 1;
        if (!rounds[previousRound].hasBeenPaid) {
            this.distribute2Projects();
        }
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
                if (!DAOMembers[msg.sender]) {
                    totalMembers++;
                }
                DAOMembers[msg.sender] = true;
                members[msg.sender].lastRoundPaid = currentRound;
                members[msg.sender].votes = 0;
            }
            members[msg.sender].votes += (amount / pricePerVote);

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
            "This project has already been submitted"
        );

        Project memory project;
        project.data = _data;
        project.proposedBy = msg.sender;

        projects[roundId][_proposedRecipient] = project;
        projectsPerRound[roundId].push(_proposedRecipient);
    }

    function voteForProject(address projectAddress, uint256 nbOfVote) external {
        // Check that member still has enough votes to use
        require(
            members[msg.sender].votes != 0,
            "You are out of votes for this round"
        );

        require(
            members[msg.sender].votes >= nbOfVote,
            "You do not have enough votes, try voting with less"
        );

        require(
            getCurrentRoundStatus() == RoundStatus.Vote,
            "Voting phase is not yet started"
        );
        require(isMember(msg.sender), "Address is not a member");

        // Check that the project exist for this round
        require(
            projects[getCurrentRound()][projectAddress].proposedBy !=
                address(0),
            "This project is not part of the current round"
        );

        members[msg.sender].votes -= nbOfVote;
        members[msg.sender].hasVotedFor.push(projectAddress);
        projects[getCurrentRound()][projectAddress].votes += nbOfVote;
    }

    function distribute2Projects() external {
        // will be called by Gelato every 4 weeks
        distributeToProjects(getCurrentRound() - 1);
    }

    function distributeToProjects(uint256 roundId) public {
        require(
            !rounds[roundId].hasBeenPaid,
            "Donations for this round have already been sent"
        );
        require(
            roundId != getCurrentRound() && roundId != 0,
            "This round is not finished yet"
        );
        require(
            projectsPerRound[roundId].length != 0,
            "There are no projects to distribute this round"
        );

        rounds[roundId].hasBeenPaid = true;
        address[] memory winners = findWinners(roundId);

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
            if (project != address(0)) {
                totalPaidProjects++;
                rounds[roundId].winningProjects.push(project);
                uint256 votes = projects[roundId][project].votes;
                uint256 amount = (rounds[roundId].balance * votes) /
                    totalVotesForWinners;
                SafeERC20.safeTransfer(IERC20(token), project, amount);
            }
        }
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
            if (
                votes != firstVotes &&
                votes != secondVotes &&
                votes != thirdVotes
            ) {
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
        }

        address[] memory firstOnes = new address[](10);
        address[] memory secondOnes = new address[](10);
        address[] memory thirdOnes = new address[](10);

        for (uint256 i = 0; i < projectsPerRound[roundId].length; i++) {
            address projectAddr = projectsPerRound[roundId][i];
            uint256 votes = projects[roundId][projectAddr].votes;
            if (votes == firstVotes) {
                firstOnes[i] = projectAddr;
            }
        }

        for (uint256 i = 0; i < projectsPerRound[roundId].length; i++) {
            address projectAddr = projectsPerRound[roundId][i];
            uint256 votes = projects[roundId][projectAddr].votes;
            if (votes == secondVotes) {
                secondOnes[i] = projectAddr;
            }
        }

        for (uint256 i = 0; i < projectsPerRound[roundId].length; i++) {
            address projectAddr = projectsPerRound[roundId][i];
            uint256 votes = projects[roundId][projectAddr].votes;
            if (votes == 0) {
                break;
            }
            if (votes == thirdVotes) {
                thirdOnes[i] = projectAddr;
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

    function getProjectsMemberVotedFor(address user)
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
        require(getCurrentRound() > 1, "The first round has not ended");
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

    function pullTokens(address _tokenAddress) external {
        require(
            msg.sender == owner,
            "You are not authorized to call this function"
        );
        require(_tokenAddress != token, "You can not pull that token");
        uint256 balanceToken = IERC20(_tokenAddress).balanceOf(address(this));
        SafeERC20.safeTransfer(IERC20(_tokenAddress), owner, balanceToken);
    }
}
