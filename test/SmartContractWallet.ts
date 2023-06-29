import {loadFixture, time} from "@nomicfoundation/hardhat-network-helpers"
import {ethers} from "hardhat"
import {Contract} from "ethers"
import {Result} from "@ethersproject/abi";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";

async function getWallet(isReal: boolean) {
    //hardhat可以从地址模拟出任何人的钱包。
    let hardhatWallet
    if (isReal) {
        [hardhatWallet] = await ethers.getSigners()
    } else {
        hardhatWallet = await ethers.getImpersonatedSigner("0xb0d1435590b4f14a5f4414f93489945546162ffc")
    }
    return hardhatWallet
}

describe("SmartContractWallet", function () {
    async function deployFixture(hardhatWallet: SignerWithAddress) {
        const Multicall3 = await ethers.getContractFactory("Multicall3", hardhatWallet)
        const multicall3 = await Multicall3.deploy()

        const SmartContractWallet = await ethers.getContractFactory("SmartContractWallet", hardhatWallet)
        const smartContractWallet = await SmartContractWallet.deploy(
            hardhatWallet.address,
            '0x0000000000000000000000000000000000000000',//multicall3.address 或者'0x0000000000000000000000000000000000000000'
            {value: '10000000000000000'}) //0.01 eth
        console.log('smartContractWallet 部署到地址:', smartContractWallet.address) //0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

        return {smartContractWallet}
    }

    describe("Deployment", function () {
        it("充值eth，然后转换成weth，然后兑换usdc,把usdc提走", async function () {
            let wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
            let usdcAddress = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
            let swapRouter = '0xE592427A0AEce92De3Edee1F18E0157C05861564'
            let aggregate3ValueAbi = [
                'function aggregate3Value(tuple(address target, bool allowFailure, uint256 value, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)'
            ]
            let swapRouterAbi = [
                'function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)'
            ]

            let hardhatWallet = await getWallet(false)
            console.log('hardhat 钱包地址: ', hardhatWallet.address) //hardhat钱包地址： 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
            const {smartContractWallet} = await loadFixture(function fixture() {
                return deployFixture(hardhatWallet)
            })
            console.log('smartContractWallet 中eth 余额：' + await hardhatWallet.provider?.getBalance(smartContractWallet.address))
            console.log('我的钱包余额：' + await hardhatWallet.provider?.getBalance(hardhatWallet.address))
            //1.转换成weth
            let wethContract = new Contract(wethAddress, ['function deposit()'], hardhatWallet)
            let receipt = await (await smartContractWallet.aggregate3Value([
                    {
                        target: wethAddress,
                        allowFailure: true,
                        value: '100000000000000000',// 把0.1个eth变成weth
                        callData: (await wethContract.populateTransaction.deposit()).data + ''
                    },
                ],
                {value: '100000000000000000'}
            )).wait()
            let event_Multicall3Args = receipt.events?.pop()?.args

            if (event_Multicall3Args?.[0]) {
                //2. 在uniswap把weth兑换usdc
                await smartContractWallet.approve(wethAddress, swapRouter, '10000000000000000000')
                let swapRouterContract = new Contract(swapRouter, swapRouterAbi, hardhatWallet)

                receipt = await (await smartContractWallet.aggregate3Value([
                        {
                            target: swapRouter,
                            allowFailure: true,
                            value: 0,
                            callData: (await swapRouterContract.populateTransaction.exactInputSingle([
                                    wethAddress,
                                    usdcAddress,
                                    500,
                                    smartContractWallet.address,
                                    (await time.latest()) + 60,
                                    '100000000000000000',
                                    '0',
                                    '0x0'
                                ])
                            ).data + ''
                        },
                    ],
                    {
                        value: 0
                    }
                )).wait()
                //console.log(`exactInputSingle events:${JSON.stringify(receipt.events)}`)

                event_Multicall3Args = receipt.events?.pop()?.args
                let aggregate3ValueReturns: Result = []
                try { // 把event_Multicall3的某个参数，解析成multicall3.aggregate3Value函数返回值，也就是：{success,returnData}[]. 注意：decodeFunctionResult返回值是数组类型，因此要获取第零个元素
                    aggregate3ValueReturns = new ethers.utils.Interface(aggregate3ValueAbi).decodeFunctionResult('aggregate3Value', event_Multicall3Args?.[1])[0]
                } catch (e: any) {
                    console.error(new Date().toLocaleString() + ' decodeFunctionResult异常：', e.stack || e)
                }
                if (event_Multicall3Args?.[0]) {
                    let outAmount
                    try { // 把aggregate3ValueReturns[0]的某个参数，解析成exactInputSingle函数返回值，也就是amountOut. 注意：decodeFunctionResult返回值是数组类型，因此要获取第零个元素
                        outAmount = new ethers.utils.Interface(swapRouterAbi).decodeFunctionResult('exactInputSingle', aggregate3ValueReturns[0][1])[0]
                    } catch (e: any) {
                        console.error(new Date().toLocaleString() + ' decodeFunctionResult异常：', e.stack || e)
                    }
                    if (aggregate3ValueReturns[0][0]) {
                        console.log(`outAmount:${outAmount}`) //185美元
                        //3.提走usdc. 提走之后，查询钱包余额
                        await (await smartContractWallet.erc20Transfer(usdcAddress, hardhatWallet.address, outAmount)).wait()
                        let balance = await smartContractWallet.erc20BalanceOf(usdcAddress, hardhatWallet.address)
                        console.log(`wallet usdc balance:${balance}`)

                        let contraceBalance = await hardhatWallet.provider?.getBalance(smartContractWallet.address)
                        console.log(`wallet eth balance before:${await hardhatWallet.provider?.getBalance(hardhatWallet.address)}`)
                        // @ts-ignore
                        await smartContractWallet.ethTransfer(hardhatWallet.address, contraceBalance.sub(2300))
                        console.log(`wallet eth balance fater:${await hardhatWallet.provider?.getBalance(hardhatWallet.address)}`)

                    }
                }
            } else {
                console.log('deposit() return false')
            }
        })

    })
})