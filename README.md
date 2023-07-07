# smart contract wallet
1. 当前阶段，如果项目是TypeScript项目，就不能使用ESM模式（不能在package.json里面指定"type": "module"）。
2. 配置forking参数，能把某个网络的当前状态都复制过来，包括所有已经部署的合约 https://hardhat.org/hardhat-network/docs/reference#forking . 推荐从Infura或Alchemy分叉
3. hardhat可以模拟出任何地址的钱包，以该地址发起交易。signer= ethers.getImpersonatedSigner(); ethers.getContractFactory("xxx", signer) 或者： 
    await hre.network.provider.request({method: "hardhat_impersonateAccount",params: ["xxx"],}); const signer = await ethers.getSigner("xx");
    要调用signer.provider.getBalance,而不能是signer.getBalance，否则会报错
4. 默认的run脚本，无法传递process.argv参数，如果你想传递，应该自己编写task.
5. xdeployer插件，帮你调用create2. 安装插件(ethers5)： npm install --save-dev 'xdeployer@^1.2.7'  ; 安装插件(ethers6)： npm install --save-dev 'xdeployer'
   执行部署命令：$env:key="pwd" ; npx hardhat xdeploy    参考https://github.com/pcaversaccio/xdeployer
   注意：msg.sender是Create2Deployer合约 ，地址是0x13b0D85CcB8bf860b6b79AF3029fCA081AE9beF2 .如果您的智能合约依赖于OpenZeppelin等常见的智能合约库，这些库将某些构造函数参数设置为msg.sender（例如owner），
   则需要将这些参数更改为tx.origin，以便将它们设置为部署人员的EOA地址

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat compile
$env:a="xxx";$env:b="xxx";  npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts --network hardhat
[win cmd] set key=pwd & npx hardhat run scripts/deploy.ts --network hardhat
[win powerShell] $env:a="xxx";$env:b="xxx"; npx hardhat run scripts/deploy.ts --network hardhat
[win powerShell] $env:a="xxx";$env:b="xxx"; npx hardhat xdeploy
npx hardhat verify --network arbitrum 0x7c487F80BEe3D7aF9047Ee0E790f2B2A8BDBF1eC 0x59f662CF5ec57E1503c2eDEa084797428BBe00FF 0x0000000000000000000000000000000000000000
```
