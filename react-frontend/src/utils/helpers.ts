import { BigNumber } from 'ethers';

export const BNtoNumber = (nb: BigNumber) => {
  return BigNumber.from(nb).toNumber();
};

export const BNtoSring = (nb: BigNumber) => {
  return BigNumber.from(nb).toString();
};

export const USDCToNumber = (nb: BigNumber) => {
  const nbDivided = BigNumber.from(nb).div(BigNumber.from(10).pow(18));
  return BNtoNumber(nbDivided);
};
