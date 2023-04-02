export default interface LiquidityEvent {
    userAddress: string
    chain: string
    token0: {
        symbol: string
        amount: number
    }
    token1: {
        symbol: string
        amount: number
    }
    lp: {
        symbol: string
        amount: number
    }
    timestamp: string
    gasFee: number
    eventType: string
}
