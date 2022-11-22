export default interface Asset {
    address: string
    chain: string
    protocol: string
    name: string
    symbol: string
    decimals: number
    logos: Array<string>
    price: number
    liquidity: number
    totalSupply: number
    isLP: boolean
    feesAPR: number
    underlyingAssets: Array<string>
    underlyingAssetsAlloc: Array<number>
    lastUpdatedAtUTC: string
}
