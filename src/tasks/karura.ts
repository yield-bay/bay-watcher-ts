import { ApiPromise, ApiRx } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { options } from '@acala-network/api';
import { Wallet, Incentive, Liquidity } from '@acala-network/sdk';
import axios from 'axios';

import { collections } from '../services/database.service';
import { FixedPointNumber } from '@acala-network/sdk-core';

export const MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000;

export const SECONDS_OF_DAY = 24 * 60 * 60;

export const MILLISECONDS_OF_YEAR = 365 * MILLISECONDS_OF_DAY;

export const SECONDS_OF_YEAR = 365 * SECONDS_OF_DAY;

export const EXPECTED_BLOCK_TIME = 12 * 1000;

export const EXPECTED_BLOCK_TIME_WITH_DELAY = 12.5 * 1000;


export const runKaruraTask = async () => {
    console.log("starting karura task");
    const provider: any = new WsProvider('wss://karura-rpc-0.aca-api.network');
    const api: any = new ApiPromise(options({ provider }));
    await api.isReady;
    const wallet = new Wallet(api);
    await wallet.isReady;

    let ict = new Incentive({ api, wallet })
    let liq = new Liquidity(api, wallet)
    let ips = await ict.getAllIncentivePools()

    const periodCount = MILLISECONDS_OF_DAY / EXPECTED_BLOCK_TIME / ict.consts.accumulatePeriod;

    const res = await axios.post("https://api.polkawallet.io/karura-dex-subql", {
        query: `
            query Token($id: String!) {
                token(id: $id) {
                    id
                    price
                    decimals
                }
            }
        `,
        variables: {
            id: "KAR"
        }
    }, {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': '',
        }
    })

    let d = JSON.parse(JSON.stringify(res.data))
    // console.log("kar", d?.data?.token?.price);
    const karPrice = parseFloat(d?.data?.token?.price ?? "0") / 10 ** 18;
    console.log("karPrice", karPrice);

    const farms: { id: string; name: string; symbol: string; apr: { reward: number | undefined, base: number | undefined }; tvl: number; rewards: { amount: number; asset: string; valueUSD: number; freq: string; }[]; }[] = []
    ips.forEach(async (ip) => {
        if (ip.enable) {
            // console.log(`${"-".repeat(50)}\npool id`, ip.id);
            // console.log("name", ip.collateral.fullname);
            // console.log("symbol", ip.collateral.display);
            // console.log("apr", ip.apr?.apr);
            const pd = await liq.getPoolDetail(ip.collateral.name)
            // console.log("tvl", pd.tvl.toNumber());
            const totalStaked = (pd?.sharePrice?.toNumber() ?? 0.0) * (ip?.totalShares?.toNumber() ?? 0.0);
            // console.log("pd shareprice", pd.sharePrice, "ip totalshares", ip.totalShares, "prod", pd.sharePrice.toNumber() * ip.totalShares.toNumber());


            // console.log("rewards:");
            // console.log("rtconfigs", ip.rewardTokensConfig, ip.savingRate);
            // ip.rewardTokensConfig.forEach((rtcf: any) => {
            //     console.log("rtcf", rtcf);
            // })

            const rewards: { amount: number; asset: string; valueUSD: number; freq: string; }[] = []
            ip.rewardTokensConfig.forEach(reward => {
                let priceUSD = 1.0;
                if (reward.token.display == "KAR")
                    priceUSD = karPrice;
                else if (reward.token.display == "aUSD")
                    priceUSD = 1.0;
                // console.log("rtoken", reward.token.display);

                if (reward.token.display == "KAR" || reward.token.display == "aUSD") {
                    rewards.push({
                        "amount": reward.amount.toNumber() * periodCount,
                        "asset": reward.token.display,
                        "valueUSD": reward.amount.toNumber() * priceUSD * periodCount,
                        "freq": "Daily",
                    })
                }
                else {
                    // console.log("🚨: some other reward");
                }

                // console.log("\tname", reward.rewardToken.display);
                // console.log("\t\tamount", reward.totalReward.toNumber(), reward.totalReward._getInner().toNumber());
                // console.log("\t\tdecimals", reward.rewardToken.decimals);
            })

            const res = await axios.post("https://api.polkawallet.io/karura-dex-subql", {
                query: `
                    query Pool($id: String!) {
                        pool(id: $id) {
                            id
                            nodeId
                            token0Id
                            token1Id
                            totalTVL
                            token0Price
                            token1Price
                            token0Amount
                            token1Amount
                            feeRate
                            dayData(orderBy: TIMESTAMP_DESC, first: 7) {
                                nodes {
                                    timestamp
                                    dailyTradeVolumeUSD
                                }
                            }
                        }
                    }
                `,
                variables: {
                    id: ip.collateral.name
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': '',
                }
            })

            let d = JSON.parse(JSON.stringify(res.data))
            // console.log("d", d);

            let dailyTradeVolumeUSDLW = 0
            d?.data?.pool?.dayData?.nodes?.forEach((dd: any) => {
                // console.log("dd", dd?.dailyTradeVolumeUSD, parseFloat(dd?.dailyTradeVolumeUSD) / 10 ** 18);
                dailyTradeVolumeUSDLW += parseFloat(dd?.dailyTradeVolumeUSD) / 10 ** 18;
            });
            // console.log("dailyTradeVolumeUSDLW", dailyTradeVolumeUSDLW);
            dailyTradeVolumeUSDLW /= d?.data?.pool?.dayData?.nodes?.length
            // console.log("dailyTradeVolumeUSDLW", dailyTradeVolumeUSDLW);
            let baseAPR = (dailyTradeVolumeUSDLW * 0.003 * 365.0 * 100.0
                / pd?.tvl?.toNumber()) ?? 0.0;

            farms.push({
                "id": ip.id,
                "name": ip.collateral.fullname,
                "symbol": ip.collateral.display,
                "apr": {
                    "reward": (ip.apr?.apr ?? 0.0) * 100.0,
                    "base": baseAPR,
                },
                "tvl": totalStaked,
                "rewards": rewards
            })
            // console.log(`pool ${ip.id}`, {
            //     "savingRate": ip.savingRate?.toNumber(),
            //     "totalShares": ip.totalShares.toNumber(),
            //     "collateral.ed": ip.collateral.ed.toNumber(),
            //     "id": ip.id,
            //     "name": ip.collateral.fullname,
            //     "symbol": ip.collateral.display,
            //     "apr": {
            //         "reward": (ip.apr?.apr ?? 0.0) * 100.0,
            //         "base": baseAPR,
            //     },
            //     "tvl": totalStaked,
            //     "rewards": rewards
            // });

            const token0 = ip.collateral.display.split(" ")[1].split("-")[0]
            const token1 = ip.collateral.display.split(" ")[1].split("-")[1]


            collections.farms?.findOneAndUpdate({
                "id": 1,
                "chef": "incentives-dex-dexshare",
                "chain": "Karura",
                "protocol": "Karura DEX",
                "asset.address": ip.id
            }, {
                "$set": {
                    "id": 1,
                    "chef": "incentives-dex-dexshare",
                    "chain": "Karura",
                    "protocol": "Karura DEX",
                    "farmType": "StandardAmm",
                    "farmImpl": "Pallet",
                    "router": "",
                    "asset": {
                        "symbol": ip.collateral.display.split(" ").reverse().join(" "),
                        "address": ip.id,
                        "price": 0.0,
                        "logos": [
                            `https://raw.githubusercontent.com/yield-bay/assets/main/list/${token0}.png`,
                            `https://raw.githubusercontent.com/yield-bay/assets/main/list/${token1}.png`,
                        ],
                        "underlyingAssets": [],
                    },
                    "tvl": totalStaked,
                    "apr.reward": (ip.apr?.apr ?? 0.0) * 100.0,
                    "apr.base": baseAPR,
                    "rewards": rewards,
                    "allocPoint": 1,
                    "lastUpdatedAtUTC": new Date().toUTCString(),
                }
            }, {
                upsert: true
            }).then(r => {
                // console.log("incentives-dex-dexshare");
            }).catch(e => {
                console.log("error incentives-dex-dexshare", e);
            })
        }
    })

    // provider
    // api.cl
}
