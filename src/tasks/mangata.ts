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

    let assetsInfo = await mangata.getAssetsInfo()
    const balance40: any = await mangata.getAmountOfTokenIdInPool('4', '0')
    const balance07: any = await mangata.getAmountOfTokenIdInPool('0', '7')
    const balance011: any = await mangata.getAmountOfTokenIdInPool('0', '11')
    console.log(`\nbal(0, 7): ${balance07}\nbal(4, 0): ${balance40}\nbal(0, 11): ${balance011}`);

    let rwd_pools_count = 3

    let mgxDecimals: number = assetsInfo[0]['decimals']
    let ksmDecimals: number = assetsInfo[4]['decimals']
    let turDecimals: number = assetsInfo[7]['decimals']
    let imbuDecimals: number = assetsInfo[11]['decimals']

    console.log("mgxDecimals", mgxDecimals, "turDecimals", turDecimals, "ksmDecimals", ksmDecimals, "imbuDecimals", imbuDecimals);

    let mgxBal4_0: number = balance40[1] / 10 ** mgxDecimals // ksm_mgx
    let mgxBal0_7: number = balance07[0] / 10 ** mgxDecimals // mgx_tur
    let mgxBal0_11: number = balance011[0] / 10 ** mgxDecimals // mgx_imbu

    console.log("mgxBal4_0", mgxBal4_0, "mgxBal0_7", mgxBal0_7, "mgxBal0_11", mgxBal0_11);

    let ksm_mgx_apr = 100 * (300 * 10 ** 6 / rwd_pools_count) / (mgxBal4_0 * 2)
    let mgx_tur_apr = 100 * (300 * 10 ** 6 / rwd_pools_count) / (mgxBal0_7 * 2)
    let mgx_imbu_apr = 100 * (300 * 10 ** 6 / rwd_pools_count) / (mgxBal0_11 * 2)

    console.log("ksm_mgx_apr", ksm_mgx_apr, "mgx_tur_apr", mgx_tur_apr, "mgx_imbu_apr", mgx_imbu_apr);

    let bal0_4_0 = balance40.toString().split(",")[0]
    let bal1_4_0 = balance40.toString().split(",")[1]

    let bal0_0_7 = balance07.toString().split(",")[0]
    let bal1_0_7 = balance07.toString().split(",")[1]

    let bal0_0_11 = balance011.toString().split(",")[0]
    let bal1_0_11 = balance011.toString().split(",")[1]

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

    console.log("mgxBuyPriceInKsm", mgxBuyPriceInKsm, "turBuyPriceInMgx", turBuyPriceInMgx, "imbuBuyPriceInMgx", imbuBuyPriceInMgx);

    const mgxInKsm = mgxBuyPriceInKsm.toNumber() / 10 ** ksmDecimals;

    const turInMgx = turBuyPriceInMgx.div(new BN((10 ** mgxDecimals).toString())).toNumber();
    const turInKsm = turInMgx * mgxInKsm;

    const imbuInMgx = imbuBuyPriceInMgx.div(new BN((10 ** mgxDecimals).toString())).toNumber();
    const imbuInKsm = imbuInMgx * mgxInKsm;

    console.log(mgxInKsm, turInKsm, turInMgx, imbuInMgx);

    let cgkres = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=kusama&vs_currencies=usd")
    const ksmInUsd = cgkres?.data?.kusama?.usd ?? 0;
    console.log("ksmInUsd", ksmInUsd);

    const ksmMgxTvl = ksmInUsd * (parseInt(bal0_4_0) / 10 ** ksmDecimals + (mgxInKsm * parseInt(bal1_4_0) / 10 ** mgxDecimals));
    console.log("ksm-mgx tvl: $", ksmMgxTvl);
    const mgxTurTvl = ksmInUsd * (mgxInKsm * parseInt(bal0_0_7) / 10 ** mgxDecimals + (turInKsm * parseInt(bal1_0_7) / 10 ** turDecimals));
    console.log("mgx-tur tvl: $", mgxTurTvl);
    const mgxImbuTvl = ksmInUsd * (mgxInKsm * parseInt(bal0_0_11) / 10 ** mgxDecimals + (imbuInKsm * parseInt(bal1_0_11) / 10 ** imbuDecimals));
    console.log("mgx-imbu tvl: $", mgxImbuTvl);

    const rewards_per_day = ksmInUsd * mgxInKsm * (300 * 10 ** 6 / (rwd_pools_count * 365))
    console.log("rewards_per_day: $", rewards_per_day, "or ", (300 * 10 ** 6 / (rwd_pools_count * 365)), "mgx");

    // base_apr

    let baseAPRKsmMgx = 0;
    let baseAPRMgxTur = 0;
    let baseAPRMgxImbu = 0;

    const getDecimals = (assetId: number, assetsInfo: TMainTokens) => {
        console.log("assetsInfo", assetsInfo[assetId.toString()].decimals, "assetId", assetId);

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

    console.log("blocknum", d?.data?.block_num ?? -1);
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

    console.log("blocknum", d1?.data?.block_num ?? -1);
    blockNowLastWeek = d1?.data?.block_num ?? -1;

    console.log("blockNow", blockNow, "blockNowLastWeek", blockNowLastWeek);

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
        console.log("dc", dc);

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

                let dci = di?.data?.count;
                console.log("dci", dci);

                events = events.concat(di?.data?.events)
            }
        }

        let swaps: any[] = []

        console.log("final events len", events.length);

        let myarr = await Promise.all(events.map(async (ev: Event) => {
            console.log("ev.extrinsic_index", ev.extrinsic_index)

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
            console.log("d1i", d3.data.extrinsic_index);

            let soldAsset = -1;
            let soldAmount = "0";
            let soldAmountUsd = 0;
            let boughtAsset = -1;
            let boughtAmount = "0";
            let boughtAmountUsd = 0;

            d3.data.params.forEach((p: Param) => {
                console.log("param", p);
                if (p.name == "sold_asset_id") {
                    soldAsset = p.value
                } else if (p.name == "sold_asset_amount") {
                    console.log("saa", p.value);
                    soldAmount = p.value;
                } else if (p.name == "bought_asset_id") {
                    boughtAsset = p.value
                } else if (p.name == "bought_asset_amount") {
                    console.log("baa", p.value);
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
        console.log("swapslen", swaps.length, swaps);

        let dailyVolumeLWKsmMgx = 0
        let dailyVolumeLWMgxTur = 0
        let dailyVolumeLWMgxImbu = 0

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
                    // mgx-tur
                    dailyVolumeLWMgxImbu += swap.amountUsd
                }
            }
        })

        console.log("dailyVolumeLWKsmMgx", dailyVolumeLWKsmMgx);
        console.log("dailyVolumeLWMgxTur", dailyVolumeLWMgxTur);
        console.log("dailyVolumeLWMgxImbu", dailyVolumeLWMgxImbu);

        dailyVolumeLWKsmMgx /= 7
        dailyVolumeLWMgxTur /= 7
        dailyVolumeLWMgxImbu /= 7

        console.log("dailyVolumeLWKsmMgx", dailyVolumeLWKsmMgx);
        console.log("dailyVolumeLWMgxTur", dailyVolumeLWMgxTur);
        console.log("dailyVolumeLWMgxImbu", dailyVolumeLWMgxImbu);

        baseAPRKsmMgx = (dailyVolumeLWKsmMgx * 0.002 * 365 * 100) / (ksmMgxTvl)
        baseAPRMgxTur = (dailyVolumeLWMgxTur * 0.002 * 365 * 100) / (mgxTurTvl)
        baseAPRMgxImbu = (dailyVolumeLWMgxImbu * 0.002 * 365 * 100) / (mgxImbuTvl)

        console.log("baseAPRKsmMgx", baseAPRKsmMgx);
        console.log("baseAPRMgxTur", baseAPRMgxTur);
        console.log("baseAPRMgxImbu", baseAPRMgxImbu);
    }

    collections.farms?.findOneAndUpdate({
        "id": 5,
        "chef": "xyk",
        "chain": "Mangata Kusama",
        "protocol": "Mangata X",
    }, {
        "$set": {
            "id": 5,
            "chef": "xyk",
            "chain": "Mangata Kusama",
            "protocol": "Mangata X",
            "farmType": "StandardAmm",
            "farmImpl": "Pallet",
            "asset": {
                "symbol": "KSM-MGX LP",
                "address": "KSM-MGX LP",
                "price": 0.0,
                "logos": [
                    "https://raw.githubusercontent.com/yield-bay/assets/main/list/KSM.png",
                    "https://raw.githubusercontent.com/yield-bay/assets/main/list/MGX.png",
                ],
            },
            "tvl": ksmMgxTvl,
            "apr.reward": ksm_mgx_apr,
            "apr.base": baseAPRKsmMgx,
            "rewards": [
                {
                    "amount": (300 * 10 ** 6 / (rwd_pools_count * 365)),
                    "asset": "MGX",
                    "valueUSD": rewards_per_day,
                    "freq": "Daily",
                }
            ],
            "allocPoint": 1,
            "lastUpdatedAtUTC": new Date().toUTCString(),
        }
    }, {
        upsert: true
    }).then(r => {
        console.log("xyk 5");
    }).catch(e => {
        console.log("error xyk 5", e);

    })

    collections.farms?.findOneAndUpdate({
        "id": 8,
        "chef": "xyk",
        "chain": "Mangata Kusama",
        "protocol": "Mangata X",
    }, {
        "$set": {
            "id": 8,
            "chef": "xyk",
            "chain": "Mangata Kusama",
            "protocol": "Mangata X",
            "farmType": "StandardAmm",
            "farmImpl": "Pallet",
            "asset": {
                "symbol": "MGX-TUR LP",
                "address": "MGX-TUR LP",
                "price": 0.0,
                "logos": [
                    "https://raw.githubusercontent.com/yield-bay/assets/main/list/MGX.png",
                    "https://raw.githubusercontent.com/yield-bay/assets/main/list/TUR.png",
                ],
            },
            "tvl": mgxTurTvl,
            "apr.reward": mgx_tur_apr,
            "apr.base": baseAPRMgxTur,
            "rewards": [
                {
                    "amount": (300 * 10 ** 6 / (rwd_pools_count * 365)),
                    "asset": "MGX",
                    "valueUSD": rewards_per_day,
                    "freq": "Daily",
                }
            ],
            "allocPoint": 1,
            "lastUpdatedAtUTC": new Date().toUTCString(),
        }
    }, {
        upsert: true
    }).then(r => {
        console.log("xyk 8");
    }).catch(e => {
        console.log("error xyk 8", e);

    })

    collections.farms?.findOneAndUpdate({
        "id": 12,
        "chef": "xyk",
        "chain": "Mangata Kusama",
        "protocol": "Mangata X",
    }, {
        "$set": {
            "id": 12,
            "chef": "xyk",
            "chain": "Mangata Kusama",
            "protocol": "Mangata X",
            "farmType": "StandardAmm",
            "farmImpl": "Pallet",
            "asset": {
                "symbol": "MGX-IMBU LP",
                "address": "MGX-IMBU LP",
                "price": 0.0,
                "logos": [
                    "https://raw.githubusercontent.com/yield-bay/assets/main/list/MGX.png",
                    "https://raw.githubusercontent.com/yield-bay/assets/main/list/IMBU.png",
                ],
            },
            "tvl": mgxImbuTvl,
            "apr.reward": mgx_imbu_apr,
            "apr.base": baseAPRMgxImbu,
            "rewards": [
                {
                    "amount": (300 * 10 ** 6 / (rwd_pools_count * 365)),
                    "asset": "MGX",
                    "valueUSD": rewards_per_day,
                    "freq": "Daily",
                }
            ],
            "allocPoint": 1,
            "lastUpdatedAtUTC": new Date().toUTCString(),
        }
    }, {
        upsert: true
    }).then(r => {
        console.log("xyk 12");
    }).catch(e => {
        console.log("error xyk 12", e);

    })
}
