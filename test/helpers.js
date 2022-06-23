const hre = require('hardhat');

async function evm_snapshot() {
  return await hre.network.provider.request({
    method: 'evm_snapshot',
    params: [],
  });
}

async function evm_revert(snapshotId) {
  return await hre.network.provider.request({
    method: 'evm_revert',
    params: [snapshotId],
  });
}

async function evm_increaseTime(timeInSeconds) {
  return await hre.network.provider.request({
    method: 'evm_increaseTime',
    params: [timeInSeconds],
  });
}

module.exports = { evm_revert, evm_snapshot, evm_increaseTime };
