import { ethers, utils } from "ethers";

import { collections } from '../services/database.service';

export const runArswTask = async () => {
    const provider = new ethers.providers.JsonRpcProvider(process.env.ASTAR_URL);
    const stableArswStakingAbi = [
        "function internalArswBalance() external view returns (uint256)"
    ]
    const moneyMakerAbi = [
        "function remittedTokens7d() external view returns (tuple(uint256 amount, uint256 blockNumber)[7])",
        "function remittedTokens1d() external view returns (tuple(uint256 amount, uint256 blockNumber))",
    ];

    let res = await collections.assets?.findOne({ "protocol": "arthswap", "chain": "astar", "address": "0xDe2578Edec4669BA7F41c5d5D2386300bcEA4678", "price": { "$ne": 0 } })
    // console.log("res", res);

    let arswPrice = res?.price ?? 0;

    let stableArswStaking = new ethers.Contract("0x42d175a498Cb517Ad29d055ea7DcFD3D99045404", stableArswStakingAbi, provider);
    let internalArswBalance = await stableArswStaking.internalArswBalance();
    // console.log("internalArswBalance", internalArswBalance);

    let moneyMaker = new ethers.Contract("0x1e385b1BbED0FD2dfaA9108577BDe9b376038C45", moneyMakerAbi, provider);
    let remittedTokens7d = await moneyMaker.remittedTokens7d();
    let sum = 0;
    remittedTokens7d.forEach((t: any) => {
        // console.log("amt", t.amount, t.amount.toString());
        sum += parseFloat(t.amount.toString());
    });
    sum /= 7;
    let apr = (36500 * sum) / parseFloat(internalArswBalance.toString());
    // console.log("apr", apr);
    let tvl = parseFloat(internalArswBalance.toString()) * arswPrice / 10 ** 18;
    // console.log("tvl", tvl);

    collections.farms?.findOneAndUpdate({
        "id": 1,
        "chef": "0x42d175a498Cb517Ad29d055ea7DcFD3D99045404",
        "chain": "Astar",
        "protocol": "Arthswap",
    }, {
        "$set": {
            "id": 1,
            "chef": "0x42d175a498Cb517Ad29d055ea7DcFD3D99045404",
            "chain": "Astar",
            "protocol": "Arthswap",
            "farmType": "SingleStaking",
            "farmImpl": "Solidity",
            "asset": {
                "symbol": "eARSW",
                "address": "eARSW",
                "price": 0.0,
                "logos": [
                    "https://raw.githubusercontent.com/yield-bay/assets/main/list/ARSW.png",
                ],
            },
            "tvl": tvl,
            "apr.reward": apr,
            "apr.base": 0,
            "rewards": [
                {
                    "amount": sum / 10 ** 18,
                    "asset": "ARSW",
                    "valueUSD": (sum / 10 ** 18) * arswPrice,
                    "freq": "Daily",
                }
            ],
            "allocPoint": 1,
            "lastUpdatedAtUTC": new Date().toUTCString(),
        }
    }, {
        upsert: true
    }).then(r => {
        // console.log("arsw ");
    }).catch(e => {
        console.log("error arsw ", e);
    })
}
