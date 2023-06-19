import { pools } from './constants'
import { fn, getLastThursday, getUpcomingThursday, getSrsPrice } from './utils'
import { getBaseAprData, getExtraRewards } from './utils/data/farm'

import { collections } from '../../services/database.service';

export const runSiriusTask = async () => {
    const availablePools = pools.filter(i => i?.addresses?.gauge)
    const upcomThu = getUpcomingThursday().unix()

    const farms = await Promise.all(
        availablePools.map(async pool => {
            console.log("sp", pool.name, pool.addresses.swap)
            const [res1, res2, res3] = await Promise.all([getBaseAprData(pool.name, getLastThursday().unix()), getBaseAprData(pool.name, upcomThu), getExtraRewards(pool.name)])
            // if (parseFloat(res1.baseApr) !== 0) {
            let farmType = 'StableAmm';
            if (pool.symbol == 'nASTR-ASTR LP') {
                farmType = 'StandardAmm';
            }
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
                "chef": "sirius-finance",
                "chain": "Astar",
                "protocol": "Sirius",
                "asset.address": pool.addresses.lpToken
            }, {
                "$set": {
                    "id": 1,
                    "chef": "sirius-finance",
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