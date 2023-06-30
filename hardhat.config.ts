import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter"
import "./scripts/task";
import "xdeployer"
import "@nomiclabs/hardhat-solhint"

let word1 = 'test test test test test test test '
let word2 = 'test test test test junk'
let infuraUrl = 'https://arbitrum-mainnet.infura.io/v3/da153625e5c247319b62d4b5a76fc639'
let ankrUrl = 'https://rpc.ankr.com/arbitrum/a769c35667e8f23271dd8ae9d396d9949d2b4c59b518932331b6aa947195a174'

const config: HardhatUserConfig = {//HardhatUserConfig类型的
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            // from: "0xb0d1435590b4f14a5f4414f93489945546162ffc",//默认的transaction.from设置,可以空着
            accounts: {//设置钱包 https://hardhat.org/hardhat-network/docs/reference#accounts
                // mnemonic:, //默认值 test test test test test test test test test test test junk
                // initialIndex:,
                // path:,
                // count:, //hd钱包要派生的账户数量
                // accountsBalance:,//账户余额wei，默认10000 ETH
                // passphrase:,//默认空字符串
            },
            forking: {//把某个网络的当前状态都复制过来，包括所有已经部署的合约 https://hardhat.org/hardhat-network/docs/reference#forking
                url: ankrUrl,
                // blockNumber:,
                enabled: true,
            },
        },
        sepolia: {
            url: "https://sepolia.infura.io/v3/key",
            // accounts: ['privateKey1', 'privateKey2',]
        },
        mainnet: {
            url: 'https://rpc.ankr.com/eth/a769c35667e8f23271dd8ae9d396d9949d2b4c59b518932331b6aa947195a174',
            accounts: [process.env.key+'']
        },
        arbitrum: {
            url: ankrUrl,
            accounts: [process.env.key+'']
        },
        zksync_era: {
            url: 'https://rpc.ankr.com/zksync_era/a769c35667e8f23271dd8ae9d396d9949d2b4c59b518932331b6aa947195a174',
            accounts: [process.env.key+'']
        },
    },
    solidity: {//参考https://docs.soliditylang.org/en/v0.8.20/using-the-compiler.html#input-description
        version: "0.8.19", //arbitrum只能支持到0.8.19，因为后面的版本引入了push0
        settings: {
            "viaIR": false,//配置启用IR
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    mocha: {
        timeout: 40000
    },
    xdeploy: {
        contract: "SmartContractWallet",
        constructorArgsPath: "./scripts/deploy-args.ts", // optional; default value is `undefined`
        salt: "WAGMI",//根据这个种子，产生随机数
        signer: process.env.key,
        networks: ["arbitrumMain"], //hardhat,ethMain,bscMain,optimismMain,arbitrumMain,polygon,avalanche,celo, gnosis(他在xDai链上),
        rpcUrls: [ankrUrl],
        gasLimit: 5_000_000, // optional; default value is `1.5e6`
    },
}

export default config;