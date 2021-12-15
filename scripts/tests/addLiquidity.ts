import { ethers } from "hardhat";
import { impersonateAccounts } from "./impersonate";
import { tokenMapping as mainnetMapping } from "./mainnet/tokens";
import { tokenMapping as polygonMapping } from "./polygon/tokens";
import { tokenMapping as avalancheMapping } from "./avalanche/tokens";

const mineTx = async (tx: any) => {
  await (await tx).wait();
};

const tokenMapping: Record<string, Record<string, any>> = {
  mainnet: mainnetMapping,
  polygon: polygonMapping,
  avalanche: avalancheMapping,
};

export async function addLiquidity(tokenName: string, address: any, amt: any) {
  const [signer] = await ethers.getSigners();
  tokenName = tokenName.toLowerCase();
  const chain = String(process.env.networkType);
  if (!tokenMapping[chain][tokenName]) {
    throw new Error(
      `Add liquidity doesn't support the following token: ${tokenName}`
    );
  }

  const token = tokenMapping[chain][tokenName];
  const [impersonatedSigner] = await impersonateAccounts([
    token.impersonateSigner,
  ]);

  // send 1 eth to cover any tx costs.
  await signer.sendTransaction({
    to: impersonatedSigner.address,
    value: ethers.utils.parseEther("1"),
  });

  await token.process(impersonatedSigner, address, amt);
}
