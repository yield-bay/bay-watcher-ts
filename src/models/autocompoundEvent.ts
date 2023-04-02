export default interface AutocompoundEvent {
    userAddress: string
    chain: string
    taskId: string
    lp: {
        symbol: string
        amount: number
    }
    duration: number
    frequency: number
    timestamp: string
    executionFee: number
    xcmpFee: number
    status: string
    eventType: string
    percentage: number
}
