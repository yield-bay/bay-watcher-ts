import { Mangata, TMainTokens } from '@mangata-finance/sdk';
import { BN } from 'bn.js';
import axios from 'axios';

import { collections } from '../services/database.service';

// events
export interface EventsRoot {
    code: number
    message: string
    generated_at: number
    data: EventsData
}

export interface EventsData {
    count: number
    events: Event[]
}

export interface Event {
    id: number
    block_timestamp: number
    event_index: string
    extrinsic_index: string
    phase: number
    module_id: string
    event_id: string
    extrinsic_hash: string
    finalized: boolean
}

// extrinsic
export interface ExtrinsicRoot {
    code: number
    message: string
    generated_at: number
    data: ExtrinsicData
}

export interface ExtrinsicData {
    block_timestamp: number
    block_num: number
    extrinsic_index: string
    call_module_function: string
    call_module: string
    account_id: string
    signature: string
    nonce: number
    extrinsic_hash: string
    success: boolean
    params: Param[]
    transfer: any
    event: ExtrinsicEvent[]
    event_count: number
    fee: string
    fee_used: string
    error: any
    finalized: boolean
    lifetime: Lifetime
    tip: string
    account_display: AccountDisplay
    crosschain_op: any
    block_hash: string
    pending: boolean
}

export interface Param {
    name: string
    type: string
    type_name: string
    value: any
}

export interface ExtrinsicEvent {
    event_index: string
    block_num: number
    extrinsic_idx: number
    module_id: string
    event_id: string
    params: string
    phase: number
    event_idx: number
    extrinsic_hash: string
    finalized: boolean
    block_timestamp: number
}

export interface Lifetime {
    birth: number
    death: number
}

export interface AccountDisplay {
    address: string
}

// block
export interface BlockRoot {
    code: number
    message: string
    generated_at: number
    data: BlockData
}

export interface BlockData {
    block_num: number
    block_timestamp: number
    // hash: string
    // parent_hash: string
    // state_root: string
    // extrinsics_root: string
    // extrinsics: Extrinsic[]
    // events: BlockEvent[]
    // logs: Log[]
    // event_count: number
    // extrinsics_count: number
    // spec_version: number
    // validator: string
    // finalized: boolean
    // account_display: AccountDisplay
}

export interface Extrinsic {
    block_timestamp: number
    block_num: number
    extrinsic_index: string
    call_module_function: string
    call_module: string
    params: string
    account_id: string
    account_index: string
    signature: string
    nonce: number
    extrinsic_hash: string
    success: boolean
    fee: string
    fee_used: string
    from_hex: string
    finalized: boolean
    account_display: any
}

export interface BlockEvent {
    event_index: string
    block_num: number
    extrinsic_idx: number
    module_id: string
    event_id: string
    params: string
    phase: number
    event_idx: number
    extrinsic_hash: string
    finalized: boolean
    block_timestamp: number
}

export interface Log {
    id: number
    block_num: number
    log_index: string
    log_type: string
    engine: string
    data: string
}

//   export interface AccountDisplay {
//     address: string
//   }


export const runMangataTask = async () => {
    const MAINNET_1 = 'wss://mangata-x.api.onfinality.io/public-ws'
    const MAINNET_2 = 'wss://prod-kusama-collator-01.mangatafinance.cloud'
    const mangata = Mangata.getInstance([MAINNET_1, MAINNET_2])

    const api = await mangata.getApi()
    console.log("Connected: ", api.isConnected)

    const pprs: any = await api.query.issuance.promotedPoolsRewardsV2()

    let assetsInfo = await mangata.getAssetsInfo()
    console.log("assetsInfo", assetsInfo);


    let weightSum = 0;
    pprs.forEach((ppr: Map<string, number>, q: any) => {
        weightSum += parseInt((ppr.get("weight") ?? "0").toString(), 10)
    })

    const balance40: any = await mangata.getAmountOfTokenIdInPool('4', '0')
    const balance07: any = await mangata.getAmountOfTokenIdInPool('0', '7')
    const balance011: any = await mangata.getAmountOfTokenIdInPool('0', '11')
    const balance014: any = await mangata.getAmountOfTokenIdInPool('0', '14')
    const balance140: any = await mangata.getAmountOfTokenIdInPool('14', '0')

    console.log("balance014", balance014, "mangata.getPools()", await mangata.getPools(), await mangata.getLiquidityTokenId("14", "0"));

    let mgxDecimals: number = assetsInfo[0]['decimals']
    let ksmDecimals: number = assetsInfo[4]['decimals']
    let turDecimals: number = assetsInfo[7]['decimals']
    let imbuDecimals: number = assetsInfo[11]['decimals']
    let bncDecimals: number = assetsInfo[14]['decimals']

    let bal0_4_0 = balance40.toString().split(",")[0]
    let bal1_4_0 = balance40.toString().split(",")[1]

    let bal0_0_7 = balance07.toString().split(",")[0]
    let bal1_0_7 = balance07.toString().split(",")[1]

    let bal0_0_11 = balance011.toString().split(",")[0]
    let bal1_0_11 = balance011.toString().split(",")[1]

    let bal0_0_14 = balance014.toString().split(",")[0]
    let bal1_0_14 = balance014.toString().split(",")[1]

    const amountPool40 = await mangata.getAmountOfTokenIdInPool("4", "0");
    const ksmReserve40 = amountPool40[0];
    const mgxReserve40 = amountPool40[1];

    const mgxBuyPriceInKsm = await mangata.calculateBuyPrice(
        ksmReserve40,
        mgxReserve40,
        new BN((10 ** mgxDecimals).toString()) // 1mgx = 1_000_000_000_000_000_000
    );

    const amountPool07 = await mangata.getAmountOfTokenIdInPool("0", "7");
    const mgxReserve07 = amountPool07[0];
    const turReserve07 = amountPool07[1];

    const turBuyPriceInMgx = await mangata.calculateBuyPrice(
        mgxReserve07,
        turReserve07,
        new BN((10 ** turDecimals).toString()) // 1tur = 1_000_000_000_0
    );

    const amountPool011 = await mangata.getAmountOfTokenIdInPool("0", "11");
    const mgxReserve011 = amountPool011[0];
    const imbuReserve011 = amountPool011[1];

    const imbuBuyPriceInMgx = await mangata.calculateBuyPrice(
        mgxReserve011,
        imbuReserve011,
        new BN((10 ** imbuDecimals).toString())
    );

    const amountPool014 = await mangata.getAmountOfTokenIdInPool("0", "14");
    const mgxReserve014 = amountPool014[0];
    const bncReserve014 = amountPool014[1];

    const bncBuyPriceInMgx = await mangata.calculateBuyPrice(
        mgxReserve014,
        bncReserve014,
        new BN((10 ** bncDecimals).toString())
    );

    const mgxInKsm = mgxBuyPriceInKsm.toNumber() / 10 ** ksmDecimals;

    const turInMgx = turBuyPriceInMgx.div(new BN((10 ** mgxDecimals).toString())).toNumber();
    const turInKsm = turInMgx * mgxInKsm;

    const imbuInMgx = imbuBuyPriceInMgx.div(new BN((10 ** mgxDecimals).toString())).toNumber();
    const imbuInKsm = imbuInMgx * mgxInKsm;

    const bncInMgx = bncBuyPriceInMgx.div(new BN((10 ** mgxDecimals).toString())).toNumber();
    const bncInKsm = bncInMgx * mgxInKsm;

    let cgkres = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=kusama&vs_currencies=usd")
    const ksmInUsd = cgkres?.data?.kusama?.usd ?? 0;

    const ksmMgxTvl = ksmInUsd * (parseInt(bal0_4_0) / 10 ** ksmDecimals + (mgxInKsm * parseInt(bal1_4_0) / 10 ** mgxDecimals));
    const mgxTurTvl = ksmInUsd * (mgxInKsm * parseInt(bal0_0_7) / 10 ** mgxDecimals + (turInKsm * parseInt(bal1_0_7) / 10 ** turDecimals));
    const mgxImbuTvl = ksmInUsd * (mgxInKsm * parseInt(bal0_0_11) / 10 ** mgxDecimals + (imbuInKsm * parseInt(bal1_0_11) / 10 ** imbuDecimals));
    const mgxBncTvl = ksmInUsd * (mgxInKsm * parseInt(bal0_0_14) / 10 ** mgxDecimals + (bncInKsm * parseInt(bal1_0_14) / 10 ** bncDecimals));

    // base_apr

    let baseAPRKsmMgx = 0;
    let baseAPRMgxTur = 0;
    let baseAPRMgxImbu = 0;
    let baseAPRMgxBnc = 0;

    const getDecimals = (assetId: number, assetsInfo: TMainTokens) => {
        return assetsInfo[assetId.toString()].decimals
    }

    // subtract 10 seconds from time to account for possible delay in subscan api
    const timeNow = Math.floor(Date.now() / 1000) - 10
    const timeNowLastWeek = Math.floor(Date.now() / 1000) - 10 - (7 * 24 * 60 * 60)

    let blockNow = -1
    let blockNowLastWeek = -1

    const res = await axios({
        method: 'post',
        url: 'https://mangatax.webapi.subscan.io/api/scan/block',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': `${process.env.SUBSCAN_API_KEY}`,
            'User-Agent': '',
        },
        data: JSON.stringify({
            "block_timestamp": timeNow
        })
    })

    let d: BlockRoot;

    d = JSON.parse(JSON.stringify(res.data))

    blockNow = d?.data?.block_num ?? -1;

    const res1 = await axios({
        method: 'post',
        url: 'https://mangatax.webapi.subscan.io/api/scan/block',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': `${process.env.SUBSCAN_API_KEY}`,
            'User-Agent': '',
        },
        data: JSON.stringify({
            "block_timestamp": timeNowLastWeek
        })
    })

    let d1: BlockRoot;

    d1 = JSON.parse(JSON.stringify(res1.data))

    blockNowLastWeek = d1?.data?.block_num ?? -1;

    if (blockNowLastWeek !== -1 && blockNow !== -1) {
        let events: any = [];
        const res2 = await axios({
            method: 'post',
            url: 'https://mangatax.webapi.subscan.io/api/v2/scan/events',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': `${process.env.SUBSCAN_API_KEY}`,
                'User-Agent': '',
            },
            data: JSON.stringify({
                "address": "", "row": 100, "page": 0, "module": "xyk", "event_id": "assetsswapped", "block_range": `${blockNowLastWeek}-${blockNow}`
            })
        })

        let d2: EventsRoot;

        d2 = JSON.parse(JSON.stringify(res2.data))

        let dc = d2?.data?.count;

        events = events.concat(d2?.data?.events)

        if (dc > 100) {
            let i = Math.floor(dc / 100)
            for (let idx = 1; idx <= i; idx++) {
                const resi = await axios({
                    method: 'post',
                    url: 'https://mangatax.webapi.subscan.io/api/v2/scan/events',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': `${process.env.SUBSCAN_API_KEY}`,
                        'User-Agent': '',
                    },
                    data: JSON.stringify({
                        "address": "", "row": 100, "page": idx, "module": "xyk", "event_id": "assetsswapped", "block_range": `${blockNowLastWeek}-${blockNow}`
                    })
                })

                let di: EventsRoot;

                di = JSON.parse(JSON.stringify(resi.data))

                events = events.concat(di?.data?.events)
            }
        }

        let swaps: any[] = []

        let myarr = await Promise.all(events.map(async (ev: Event) => {
            const res = await axios({
                method: 'post',
                url: 'https://mangatax.webapi.subscan.io/api/scan/extrinsic',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': `${process.env.SUBSCAN_API_KEY}`,
                    'User-Agent': '',
                },
                data: JSON.stringify({
                    "extrinsic_index": `${ev.extrinsic_index}`,
                    "events_limit": 10,
                    "focus": `${ev.extrinsic_index}`
                })
            })

            let d3: ExtrinsicRoot;

            d3 = JSON.parse(JSON.stringify(res.data))

            let soldAsset = -1;
            let soldAmount = "0";
            let soldAmountUsd = 0;
            let boughtAsset = -1;
            let boughtAmount = "0";
            let boughtAmountUsd = 0;

            d3?.data?.params?.forEach((p: Param) => {
                if (p.name == "sold_asset_id") {
                    soldAsset = p.value
                } else if (p.name == "sold_asset_amount") {
                    soldAmount = p.value;
                } else if (p.name == "bought_asset_id") {
                    boughtAsset = p.value
                } else if (p.name == "bought_asset_amount") {
                    boughtAmount = p.value;
                }
            })

            let swapType = "";

            if (soldAsset !== -1) {
                let sa = (parseInt(soldAmount, 10) / 10 ** getDecimals(soldAsset, assetsInfo), 10).toString()
                if (soldAsset == 4) {
                    // ksm
                    soldAmountUsd = parseInt(sa, 10) * ksmInUsd
                } else if (soldAsset == 0) {
                    // mgx
                    soldAmountUsd = parseInt(sa, 10) * mgxInKsm * ksmInUsd
                } else if (soldAsset == 7) {
                    // tur
                    soldAmountUsd = parseInt(sa, 10) * turInKsm * ksmInUsd
                } else if (soldAsset == 11) {
                    // imbu
                    soldAmountUsd = parseInt(sa, 10) * imbuInKsm * ksmInUsd
                } else if (soldAsset == 14) {
                    // bnc
                    soldAmountUsd = parseInt(sa, 10) * bncInKsm * ksmInUsd
                }
                return {
                    soldAsset: soldAsset,
                    boughtAsset: boughtAsset,
                    amount: soldAmount,
                    amountUsd: soldAmountUsd,
                    swapType: "sell"
                }
            } else if (boughtAsset !== -1) {
                let ba = (parseInt(boughtAmount, 10) / 10 ** getDecimals(boughtAsset, assetsInfo), 10).toString()
                if (boughtAsset == 4) {
                    // ksm
                    boughtAmountUsd = parseInt(ba, 10) * ksmInUsd
                } else if (boughtAsset == 0) {
                    // mgx
                    boughtAmountUsd = parseInt(ba, 10) * mgxInKsm * ksmInUsd
                } else if (boughtAsset == 7) {
                    // tur
                    boughtAmountUsd = parseInt(ba, 10) * turInKsm * ksmInUsd
                } else if (boughtAsset == 11) {
                    // imbu
                    boughtAmountUsd = parseInt(ba, 10) * imbuInKsm * ksmInUsd
                } else if (boughtAsset == 14) {
                    // bnc
                    boughtAmountUsd = parseInt(ba, 10) * bncInKsm * ksmInUsd
                }
                return {
                    soldAsset: soldAsset,
                    boughtAsset: boughtAsset,
                    amount: boughtAmount,
                    amountUsd: boughtAmountUsd,
                    swapType: "buy"
                }
            }
        }))

        if (myarr == undefined || typeof myarr == undefined) {
            swaps = []
        } else {
            swaps = myarr
        }

        let dailyVolumeLWKsmMgx = 0
        let dailyVolumeLWMgxTur = 0
        let dailyVolumeLWMgxImbu = 0
        let dailyVolumeLWMgxBnc = 0

        swaps.forEach((swap) => {
            if (swap !== undefined && typeof swap !== undefined) {
                if ((swap.boughtAsset == 4 && swap.soldAsset == 0) || (swap.boughtAsset == 0 && swap.soldAsset == 4)) {
                    // ksm-mgx
                    dailyVolumeLWKsmMgx += swap.amountUsd
                }
                if ((swap.boughtAsset == 0 && swap.soldAsset == 7) || (swap.boughtAsset == 7 && swap.soldAsset == 0)) {
                    // mgx-tur
                    dailyVolumeLWMgxTur += swap.amountUsd
                }
                if ((swap.boughtAsset == 0 && swap.soldAsset == 11) || (swap.boughtAsset == 11 && swap.soldAsset == 0)) {
                    // mgx-imbu
                    dailyVolumeLWMgxImbu += swap.amountUsd
                }
                if ((swap.boughtAsset == 0 && swap.soldAsset == 14) || (swap.boughtAsset == 14 && swap.soldAsset == 0)) {
                    // mgx-bnc
                    dailyVolumeLWMgxBnc += swap.amountUsd
                }
            }
        })

        dailyVolumeLWKsmMgx /= 7
        dailyVolumeLWMgxTur /= 7
        dailyVolumeLWMgxImbu /= 7
        dailyVolumeLWMgxBnc /= 7

        baseAPRKsmMgx = (dailyVolumeLWKsmMgx * 0.002 * 365 * 100) / (ksmMgxTvl)
        baseAPRMgxTur = (dailyVolumeLWMgxTur * 0.002 * 365 * 100) / (mgxTurTvl)
        baseAPRMgxImbu = (dailyVolumeLWMgxImbu * 0.002 * 365 * 100) / (mgxImbuTvl)
        baseAPRMgxBnc = (dailyVolumeLWMgxBnc * 0.002 * 365 * 100) / (mgxBncTvl)
    }


    pprs.forEach(async (ppr: Map<string, number>, q: any) => {
        console.log("ppr", ppr.get("weight")?.toString(), "q", q?.toString());
        const weight = parseInt((ppr.get("weight") ?? "0").toString(), 10)

        let y = await mangata.getLiquidityPool(q?.toString())
        console.log("farm id:", q?.toString(), "underlying pool:", y);

        const token0 = y[0].toString()
        const token1 = y[1].toString()

        const balance: any[] = await mangata.getAmountOfTokenIdInPool(token0, token1)

        const symbol0 = assetsInfo[token0]['symbol'];
        const symbol1 = assetsInfo[token1]['symbol'];
        let liq = 1;
        if (symbol0 == "MGX" || symbol1 == "MGX") {
            let mgxIdx = 0;
            let mgxBal = 0;

            if (token0 == "0") {
                mgxIdx = 0
                mgxBal = balance[mgxIdx] / 10 ** assetsInfo["0"]["decimals"]

            } else if (token1 == "0") {
                mgxIdx = 1;
                mgxBal = balance[mgxIdx] / 10 ** assetsInfo["0"]["decimals"]
            }

            liq = mgxBal * 2;
        } else if (symbol0 == "KSM" || symbol1 == "KSM") {
            let ksmIdx = 0;
            let ksmBal = 0;

            if (token0 == "4") {
                ksmIdx = 0
                ksmBal = balance[ksmIdx] / 10 ** assetsInfo["4"]["decimals"]
            } else if (token1 == "4") {
                ksmIdx = 1;
                ksmBal = balance[ksmIdx] / 10 ** assetsInfo["4"]["decimals"]
            }

            liq = (ksmBal / mgxInKsm) * 2;
        }

        const apr = 100 * ((300 * 10 ** 6) * weight / weightSum) / (liq)

        const bal0 = balance.toString().split(",")[0]
        const bal1 = balance.toString().split(",")[1]

        let baseApr = 0;
        let tvl = 0;

        if (q?.toString() == "5") {
            tvl = ksmMgxTvl;
            baseApr = baseAPRKsmMgx;
        } else if (q?.toString() == "8") {
            tvl = mgxTurTvl;
            baseApr = baseAPRMgxTur;
        } else if (q?.toString() == "12") {
            tvl = mgxImbuTvl;
            baseApr = baseAPRMgxImbu;
        } else if (q?.toString() == "17") {
            tvl = mgxBncTvl;
            baseApr = baseAPRMgxBnc;
        }

        collections.farms?.findOneAndUpdate({
            "id": parseInt(q?.toString(), 10),
            "chef": "xyk",
            "chain": "Mangata Kusama",
            "protocol": "Mangata X",
        }, {
            "$set": {
                "id": parseInt(q?.toString(), 10),
                "chef": "xyk",
                "chain": "Mangata Kusama",
                "protocol": "Mangata X",
                "farmType": "StandardAmm",
                "farmImpl": "Pallet",
                "asset": {
                    "symbol": `${symbol0}-${symbol1} LP`,
                    "address": `${symbol0}-${symbol1} LP`,
                    "price": 0.0,
                    "logos": [
                        `https://raw.githubusercontent.com/yield-bay/assets/main/list/${symbol0}.png`,
                        `https://raw.githubusercontent.com/yield-bay/assets/main/list/${symbol1}.png`,
                    ],
                },
                "tvl": tvl,
                "apr.reward": apr,
                "apr.base": baseApr,
                "rewards": [
                    {
                        "amount": (((300 * 10 ** 6) * (weight / weightSum)) / 365),
                        "asset": "MGX",
                        "valueUSD": ksmInUsd * mgxInKsm * (((300 * 10 ** 6) * (weight / weightSum)) / 365),
                        "freq": "Daily",
                    }
                ],
                "allocPoint": 1,
                "lastUpdatedAtUTC": new Date().toUTCString(),
            }
        }, {
            upsert: true
        }).then(r => {
            console.log("xyk");
        }).catch(e => {
            console.log("error xyk", e);
        })
    });
}
