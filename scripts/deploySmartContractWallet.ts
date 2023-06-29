import {ethers} from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";

/**
 * 这是普通的部署。如果要让各链上的合约地址一样，应该用xdeploy插件：https://github.com/pcaversaccio/xdeployer
 * @param isReal
 */
async function getWallet(isReal: boolean) {
    //hardhat可以从地址模拟出任何人的钱包。
    let hardhatWallet
    if (isReal) {
        hardhatWallet = (await ethers.getSigners())[0] //realWallet
    } else {
        hardhatWallet = await ethers.getImpersonatedSigner("0xb0d1435590b4f14a5f4414f93489945546162ffc")
    }
    return hardhatWallet
}

async function deploy(hardhatWallet: SignerWithAddress) {
    // const Multicall3 = await ethers.getContractFactory("Multicall3", hardhatWallet)
    // const multicall3 = await Multicall3.deploy()

    const SmartContractWallet = await ethers.getContractFactory("SmartContractWallet", hardhatWallet)
    const smartContractWallet = await SmartContractWallet.deploy(
        hardhatWallet.address,
        '0x0000000000000000000000000000000000000000',//multicall3.address 或者'0x0000000000000000000000000000000000000000'
        {value: '0', gasLimit: 1000_0000})
    console.log('smartContractWallet 部署到地址:', smartContractWallet.address)
    return {smartContractWallet}
}

async function main() {
    let hardhatWallet = await getWallet(true)
    console.log('hardhat 钱包地址: ', hardhatWallet?.address)
    const {smartContractWallet} = await deploy(hardhatWallet)
    console.log('smartContractWallet 中eth 余额：' + await hardhatWallet.provider?.getBalance(smartContractWallet.address))
    console.log('我的钱包余额：' + await hardhatWallet.provider?.getBalance(hardhatWallet.address))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
