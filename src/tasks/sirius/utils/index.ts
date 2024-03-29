import memoize from 'memoizee'
import { utils } from 'ethers'
const { parseUnits } = utils
import moment from 'moment'
import fetch from 'node-fetch'
import { pools, coins, GRAPH_URL, GECKO_URL } from '../constants'
import { PoolTypes } from '../constants/pools'
import { BigNumberish } from '@ethersproject/bignumber'
const ONE_MINUTE = 6e4

export * from './api'

// export const getCoinIndex = (pool_id: string, symbol: any) => {
//   const pool = pools.find((i: any) => (i.addresses.deposit || i.addresses.swap).toLowerCase() == pool_id.toLowerCase())
//   if (!pool) throw 'pool is not found by pool_id'
//   return pool.coins.findIndex((i: { symbol: any }) => i.symbol == symbol)
// }

// export const getCoinDecimals = (symbol: string) => {
//   const coin: any = Object.values(coins).find((i: any) => i.symbol == symbol)
//   if (!coin) throw 'coin is not found by symbol'
//   return coin.decimals
// }

// cast to 18 decimals
export const castTo18 = (bn: BigNumberish, decimals: number) =>
  parseUnits('10', 0)
    .pow(18 - decimals)
    .mul(bn)

// Fix BN conversion error caused by decimal place greater than 18 digits
export const removeExtraDecimal = (num: string) => {
  num = num.toString() || '0'
  const extraDecimal = (num.split('.')[1] || '0').length - 18
  if (extraDecimal > 0) num = num.slice(0, -extraDecimal)
  return num
}

export const getGraph = async (query: string) => {
  const fr: any = await fetch(GRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  })
  return await (
    fr
  ).json()
}
// Zero time of this Thursday or last Thursday
export function getLastThursday() {
  const now = moment().utc()
  const day = now.day()
  // Whether today is less than Thursday
  const ltThu = day < 4
  return now.subtract(ltThu ? day + 3 : day - 4, 'd').startOf('day')
}

// Zero time of this Thursday or next Thursday
export function getUpcomingThursday() {
  const now = moment().utc()
  const day = now.day()
  const ltThu = day < 4
  return now.add((ltThu ? 4 : 11) - day, 'd').startOf('day')
}

export const getCoinPrice = memoize(
  async (symbol: any) => {
    const coin: any = Object.values(coins).find((i: any) => i.symbol == symbol && i.geckoId)
    if (!coin) throw 'coin is not found by symbol'

    const url = `${GECKO_URL}/simple/price?ids=${coin.geckoId}&vs_currencies=usd`
    const res: any = await (await fetch(url)).json()
    return res[coin.geckoId]?.usd || 0
  },
  { promise: true, maxAge: ONE_MINUTE }
)

export const getSrsPrice = memoize(
  async () => {
    const url = 'https://api.dexscreener.com/latest/dex/pairs/astar/0xde2edaa0cd4afd59d9618c31a060eab93ce45e01'
    const res: any = await (await fetch(url)).json()
    return res?.pair?.priceUsd || 0
  },
  { promise: true, maxAge: 5e3 } // 5 seconds
)

export const getNastrWastrPrice = memoize(
  async () => {
    const url = 'https://api.dexscreener.com/latest/dex/pairs/astar/0xb4461721d3ad256cd59d207fefbfe05791ef8568'
    const res: any = await (await fetch(url)).json()
    return res?.pair?.priceUsd || 0
  },
  { promise: true, maxAge: 5e3 } // 5 seconds
)

export const getTokenSymbolForPoolType = (poolType: any) => (poolType === PoolTypes.ETH ? 'WETH' : poolType === PoolTypes.USD ? 'USDC' : '')

