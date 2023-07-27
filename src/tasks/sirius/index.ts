import { pools } from './constants'
import { fn, getLastThursday, getUpcomingThursday, getSrsPrice, getNastrWastrPrice } from './utils'
import { getBaseAprData, getExtraRewards } from './utils/data/farm'

import { collections } from '../../services/database.service';

export const runSiriusTask = async () => {
    const availablePools = pools.filter(i => i?.addresses?.gauge)
    const upcomThu = getUpcomingThursday().unix()

    const srsPrice = await getSrsPrice()
    const nastrWastrPrice = await getNastrWastrPrice()
    console.log("siriusprice", srsPrice, "nastrWastrPrice", nastrWastrPrice, typeof nastrWastrPrice)
    collections.assets?.findOneAndUpdate({
        // "address": "0xb4461721d3AD256CD59D207fEfBfE05791Ef8568", // arthswap nASTR-WASTR LP
        "address": "0xcB274236fBA7B873FC8F154bb0475a166C24B119",
        "chain": "Astar",
        "protocol": "Sirius",
    }, {
        "$set": {
            // "address": "0xb4461721d3AD256CD59D207fEfBfE05791Ef8568", // arthswap nASTR-WASTR LP
            "address": "0xcB274236fBA7B873FC8F154bb0475a166C24B119",
            "chain": "Astar",
            "protocol": "Sirius",
            "decimals": 18,
            "feesAPR": 0,
            "isLP": true,
            "lastUpdatedAtUTC": new Date().toUTCString(),
            "liquidity": 0,
            "logos": [
                "https://raw.githubusercontent.com/yield-bay/assets/main/list/ASTR.png",
                "https://raw.githubusercontent.com/yield-bay/assets/main/list/nASTR.png"
            ],
            "name": "nASTR-ASTR LP",
            "price": parseFloat(nastrWastrPrice),
            "symbol": "nASTR-ASTR LP",
            "totalSupply": 0,
            "underlyingAssets": [
                {
                    "symbol": "ASTR",
                    "address": "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720",
                    "decimals": 18
                },
                {
                    "symbol": "nASTR",
                    "address": "0xE511ED88575C57767BAfb72BfD10775413E3F2b0",
                    "decimals": 18
                },
            ],
            "underlyingAssetsAlloc": [],
        }
    }, {
        upsert: true
    }).then(r => {
        // console.log("sirius-finance", pool.symbol);
    }).catch(e => {
        console.log("error sirius-finance", e);
    })
    collections.assets?.findOneAndUpdate({
        "address": "0x9448610696659de8F72e1831d392214aE1ca4838", // SRS
        "chain": "Astar",
        "protocol": "Sirius",
    }, {
        "$set": {
            "address": "0x9448610696659de8F72e1831d392214aE1ca4838",
            "chain": "Astar",
            "protocol": "Sirius",
            "decimals": 18,
            "feesAPR": 0,
            "isLP": false,
            "lastUpdatedAtUTC": new Date().toUTCString(),
            "liquidity": 0,
            "logos": [
                "https://raw.githubusercontent.com/yield-bay/assets/main/list/SRS.png",
            ],
            "name": "SRS",
            "price": parseFloat(srsPrice),
            "symbol": "SRS",
            "totalSupply": 0,
            "underlyingAssets": [],
            "underlyingAssetsAlloc": [],
        }
    }, {
        upsert: true
    }).then(r => {
        // console.log("sirius-finance", pool.symbol);
    }).catch(e => {
        console.log("error sirius-finance", e);
    })

    const farms = await Promise.all(
        availablePools.map(async pool => {
            console.log("sp", pool.name, pool.addresses.swap)
            const [res1, res2, res3] = await Promise.all([getBaseAprData(pool.name, getLastThursday().unix()), getBaseAprData(pool.name, upcomThu), getExtraRewards(pool.name)])
            // if (parseFloat(res1.baseApr) !== 0) {
            const farmType = 'StableAmm';
            // if (pool.symbol == 'nASTR-ASTR LP') {
            //     farmType = 'StandardAmm';
            // }
            let logos: string[] = []
            let underlyingAssets: any[] = []
            pool.coins.forEach((c: any) => {
                logos.push(`https://raw.githubusercontent.com/yield-bay/assets/main/list/${c.symbol}.png`)
                underlyingAssets.push({
                    symbol: c.symbol,
                    address: c.address,
                    decimals: c.decimals,
                })
            })
            collections.farms?.findOneAndUpdate({
                "id": 1,
                "chef": pool.addresses.gauge,
                "chain": "Astar",
                "protocol": "Sirius",
                "asset.address": pool.addresses.lpToken
            }, {
                "$set": {
                    "id": 1,
                    "chef": pool.addresses.gauge,
                    "chain": "Astar",
                    "protocol": "Sirius",
                    "farmType": farmType,
                    "farmImpl": "Pallet",
                    "router": pool.addresses.swap,
                    "asset": {
                        "symbol": pool.symbol,
                        "address": pool.addresses.lpToken,
                        "price": 0.0,
                        "logos": logos,
                        "underlyingAssets": underlyingAssets,
                    },
                    "tvl": parseFloat(res1.tvl),
                    "apr.reward": (parseFloat(res1.baseApr) ?? 0.0) * 100.0,
                    "apr.base": 0,
                    "rewards": [
                        {
                            "asset": "SRS",
                            "amount": parseFloat(res1.rewardSrsPerDay),
                            "valueUSD": parseFloat(res1.rewardPerDay),
                            "freq": "Daily"
                        }
                    ],
                    "allocPoint": 1,
                    "lastUpdatedAtUTC": new Date().toUTCString(),
                }
            }, {
                upsert: true
            }).then(r => {
                // console.log("sirius-finance", pool.symbol);
            }).catch(e => {
                console.log("error sirius-finance", e);
            })
            // }

            return {
                contract: pool.addresses.gauge,
                name: pool.name,
                symbol: pool.symbol,
                tvl: res1.tvl,
                baseApr: res1.baseApr,
                rewardRate: res1.rewardRate,
                rewardSrsPerDay: res1.rewardSrsPerDay,
                rewardPerDayUsd: res1.rewardPerDay,
                baseAprUpcom: res2.baseApr,
                rewardRateUpcom: res2.rewardRate,
                rewardSrsPerDayUpcom: res2.rewardSrsPerDay,
                extraRewards: res3
            }
        })
    )
}