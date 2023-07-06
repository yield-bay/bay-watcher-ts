import { createInterBtcApi, } from "@interlay/interbtc-api"
import { BN } from "bn.js"
import axios from "axios"

import { collections } from "../services/database.service"

export const runInterlayTask = async () => {
    // If you are using a local development environment
    // const PARACHAIN_ENDPOINT = "ws://127.0.0.1:9944";
    // if you want to use the Interlay-hosted beta network
    const PARACHAIN_ENDPOINT = "wss://api.interlay.io/parachain"
    const bitcoinNetwork = "mainnet"
    const interBTC = await createInterBtcApi(PARACHAIN_ENDPOINT, bitcoinNetwork)
    const lptokens = await interBTC.amm.getLiquidityPools()
    console.log("lptokens", lptokens)
    const res = await axios.get("https://app.interlay.io/marketdata/price?vs_currencies=usd&ids=bitcoin,polkadot,bitcoin,interlay,liquid-staking-dot,tether")
    console.log("res", res?.data)
    lptokens.forEach((lpt: any) => {
        console.log(lpt.lpToken.name)
        // console.log("ramtannual", lpt.rewardAmountsYearly)//.currency, lpt.rewardAmountsYearly._amount)

        console.log("totalSupply", lpt.totalSupply.currency, lpt.totalSupply._amount.toString())
        console.log("reserve0", lpt.reserve0.currency, lpt.reserve0._amount.toString())
        console.log("reserve1", lpt.reserve1.currency, lpt.reserve1._amount.toString())
        console.log("thisss", res?.data[lpt.reserve0.currency.name.split(" ")[0].toLowerCase()], res?.data[lpt.reserve1.currency.name.split(" ")[0].toLowerCase()])

        const tvl = res?.data[lpt.reserve0.currency.name.split(" ")[0].toLowerCase()].usd * parseInt(lpt.reserve0._amount.toString(), 10) / 10 ** lpt.reserve0.currency.decimals + res?.data[lpt.reserve1.currency.name.split(" ")[0].toLowerCase()].usd * parseInt(lpt.reserve1._amount.toString(), 10) / 10 ** lpt.reserve1.currency.decimals
        console.log("tvl", tvl)//, parseInt(lpt.reserve0._amount.toString(), 10) / 10 ** lpt.reserve0.currency.decimals, parseInt(lpt.reserve1._amount.toString(), 10) / 10 ** lpt.reserve1.currency.decimals)

        console.log("rewards:")
        const rewardsPerDay: { amount: number; asset: any; valueUSD: number; freq: string }[] = []
        let totalApr = 0
        lpt.rewardAmountsYearly.forEach((r: any) => {
            console.log(r.currency, r._amount.toString())
            rewardsPerDay.push({
                amount: (parseInt(r._amount.toString(), 10) / 10 ** r.currency.decimals) / 365,
                asset: r.currency.ticker,
                valueUSD: res?.data[r.currency.name.split(" ")[0].toLowerCase()].usd * (parseInt(r._amount.toString(), 10) / 10 ** r.currency.decimals) / 365,
                freq: "Daily",
            })
            totalApr += 100 * res?.data[r.currency.name.split(" ")[0].toLowerCase()].usd * (parseInt(r._amount.toString(), 10) / 10 ** r.currency.decimals) / tvl
        })
        console.log("tradingFee", parseFloat(lpt.tradingFee.toString()) * 100)
        console.log("rewards", rewardsPerDay)
        console.log("totalApr", totalApr)

        collections.farms?.findOneAndUpdate({
            "id": 65,
            "chef": "Interlay BTC",
            "chain": "Interlay Polkadot",
            "protocol": "Interlay",
            "symbol": `${lpt.lpToken.name.split(" ")[1]} LP`,
        }, {
            "$set": {
                "id": 65,
                "chef": "Interlay BTC",
                "chain": "Interlay Polkadot",
                "protocol": "Interlay",
                "farmType": lpt.type == "STANDARD" ? "StandardAmm" : "StableAmm",
                "farmImpl": "Pallet",
                "router": "",
                "asset": {
                    "symbol": `${lpt.lpToken.name.split(" ")[1]} LP`,
                    "address": `${lpt.lpToken.name.split(" ")[1]} LP`,
                    "price": 0.0,
                    "logos": [
                        `https://raw.githubusercontent.com/yield-bay/assets/main/list/${lpt.lpToken.name.split(" ")[1].split("-")[0]}.png`,
                        `https://raw.githubusercontent.com/yield-bay/assets/main/list/${lpt.lpToken.name.split(" ")[1].split("-")[1]}.png`,
                    ],
                    "underlyingAssets": [],
                },
                "tvl": tvl,
                "apr.reward": totalApr,
                "apr.base": parseFloat(lpt.tradingFee.toString()) * 100,
                "rewards": rewardsPerDay,
                "allocPoint": 1,
                "lastUpdatedAtUTC": new Date().toUTCString(),
            }
        }, {
            upsert: true
        }).then(r => {
            console.log("interlay")
        }).catch(e => {
            console.log("error interlay", e)
        })
    })
}