// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TestContract {
    string public message = "Hello World";
    
    function setMessage(string memory _message) external {
        message = _message;
    }
}