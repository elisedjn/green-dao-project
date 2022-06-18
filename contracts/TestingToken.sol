// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestingToken is ERC20, Ownable {
    constructor() ERC20("TestingToken", "TTK") {
        _mint(msg.sender, 1000000 * 10**6);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
