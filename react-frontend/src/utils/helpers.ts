import { BigNumber } from 'ethers';

export const BNtoNumber = (nb: BigNumber) => {
  return BigNumber.from(nb).toNumber();
};

export const BNtoSring = (nb: BigNumber) => {
  return BigNumber.from(nb).toString();
};
