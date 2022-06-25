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

const errArray = [
  "Price per vote too low",
  "Proposals are closed for this round",
  "Address is not a member",
  "This project has already been submitted",
  "You are out of votes for this round",
  "Voting phase is not yet started",
  "Address is not a member",
  "This project is not part of the current round",
  "Donations for this round have already been sent",
  "This round is not finished yet",
  "There are no projects to distribute this round",
  "Address is not a member",
  "The first round has not ended",
  "You are not authorized to call this function",
  "You can not pull that token"
]

export const displayError = (err: string) => {

  for (let i = 0; i < errArray.length; i++){
    if (error.message.includes.(errArray[i]) {
      return errArray[i];
    })
  }
}
