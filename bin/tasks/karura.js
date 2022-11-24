"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runKaruraTask = exports.EXPECTED_BLOCK_TIME_WITH_DELAY = exports.EXPECTED_BLOCK_TIME = exports.SECONDS_OF_YEAR = exports.MILLISECONDS_OF_YEAR = exports.SECONDS_OF_DAY = exports.MILLISECONDS_OF_DAY = void 0;
const api_1 = require("@polkadot/api");
const rpc_provider_1 = require("@polkadot/rpc-provider");
const api_2 = require("@acala-network/api");
const sdk_1 = require("@acala-network/sdk");
const axios_1 = __importDefault(require("axios"));
const database_service_1 = require("../services/database.service");
exports.MILLISECONDS_OF_DAY = 24 * 60 * 60 * 1000;
exports.SECONDS_OF_DAY = 24 * 60 * 60;
exports.MILLISECONDS_OF_YEAR = 365 * exports.MILLISECONDS_OF_DAY;
exports.SECONDS_OF_YEAR = 365 * exports.SECONDS_OF_DAY;
exports.EXPECTED_BLOCK_TIME = 12 * 1000;
exports.EXPECTED_BLOCK_TIME_WITH_DELAY = 12.5 * 1000;
const runKaruraTask = async () => {
    var _a, _b, _c;
    const provider = new rpc_provider_1.WsProvider('wss://karura-rpc-0.aca-api.network');
    const api = new api_1.ApiPromise((0, api_2.options)({ provider }));
    await api.isReady;
    const wallet = new sdk_1.Wallet(api);
    await wallet.isReady;
    let ict = new sdk_1.Incentive(api, wallet);
    let liq = new sdk_1.Liquidity(api, wallet);
    let ips = await ict.getAllIncentivePools();
    const periodCount = exports.MILLISECONDS_OF_DAY / exports.EXPECTED_BLOCK_TIME / ict.consts.accumulatePeriod;
    const res = await axios_1.default.post("https://api.polkawallet.io/karura-dex-subql", {
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
    });
    let d = JSON.parse(JSON.stringify(res.data));
    // console.log("kar", d?.data?.token?.price);
    const karPrice = parseFloat((_c = (_b = (_a = d === null || d === void 0 ? void 0 : d.data) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.price) !== null && _c !== void 0 ? _c : "0") / 10 ** 18;
    console.log("karPrice", karPrice);
    const farms = [];
    ips.forEach(async (ip) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        if (ip.enable) {
            // console.log(`${"-".repeat(50)}\npool id`, ip.id);
            // console.log("name", ip.collateral.fullname);
            // console.log("symbol", ip.collateral.display);
            // console.log("apr", ip.apr?.apr);
            const pd = await liq.getPoolDetail(ip.collateral.name);
            // console.log("tvl", pd.tvl.toNumber());
            // console.log("rewards:");
            // console.log("rtconfigs", ip.rewardTokensConfig, ip.savingRate);
            // ip.rewardTokensConfig.forEach((rtcf: any) => {
            //     console.log("rtcf", rtcf);
            // })
            const rewards = [];
            ip.rewardTokensConfig.forEach(reward => {
                let priceUSD = 1.0;
                if (reward.token.display == "KAR")
                    priceUSD = karPrice;
                else if (reward.token.display == "aUSD")
                    priceUSD = 1.0;
                console.log("rtoken", reward.token.display);
                if (reward.token.display == "KAR" || reward.token.display == "aUSD") {
                    rewards.push({
                        "amount": reward.amount.toNumber() * periodCount,
                        "asset": reward.token.display,
                        "valueUSD": reward.amount.toNumber() * priceUSD * periodCount,
                        "freq": "Daily",
                    });
                }
                else
                    console.log("🚨: some other reward");
                // console.log("\tname", reward.rewardToken.display);
                // console.log("\t\tamount", reward.totalReward.toNumber(), reward.totalReward._getInner().toNumber());
                // console.log("\t\tdecimals", reward.rewardToken.decimals);
            });
            const res = await axios_1.default.post("https://api.polkawallet.io/karura-dex-subql", {
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
            });
            let d = JSON.parse(JSON.stringify(res.data));
            // console.log("d", d);
            let dailyTradeVolumeUSDLW = 0;
            (_d = (_c = (_b = (_a = d === null || d === void 0 ? void 0 : d.data) === null || _a === void 0 ? void 0 : _a.pool) === null || _b === void 0 ? void 0 : _b.dayData) === null || _c === void 0 ? void 0 : _c.nodes) === null || _d === void 0 ? void 0 : _d.forEach((dd) => {
                // console.log("dd", dd?.dailyTradeVolumeUSD, parseFloat(dd?.dailyTradeVolumeUSD) / 10 ** 18);
                dailyTradeVolumeUSDLW += parseFloat(dd === null || dd === void 0 ? void 0 : dd.dailyTradeVolumeUSD) / 10 ** 18;
            });
            console.log("dailyTradeVolumeUSDLW", dailyTradeVolumeUSDLW);
            dailyTradeVolumeUSDLW /= (_h = (_g = (_f = (_e = d === null || d === void 0 ? void 0 : d.data) === null || _e === void 0 ? void 0 : _e.pool) === null || _f === void 0 ? void 0 : _f.dayData) === null || _g === void 0 ? void 0 : _g.nodes) === null || _h === void 0 ? void 0 : _h.length;
            console.log("dailyTradeVolumeUSDLW", dailyTradeVolumeUSDLW);
            let baseAPR = (_k = (dailyTradeVolumeUSDLW * 0.003 * 365.0 * 100.0
                / ((_j = pd === null || pd === void 0 ? void 0 : pd.tvl) === null || _j === void 0 ? void 0 : _j.toNumber()))) !== null && _k !== void 0 ? _k : 0.0;
            farms.push({
                "id": ip.id,
                "name": ip.collateral.fullname,
                "symbol": ip.collateral.display,
                "apr": {
                    "reward": ((_m = (_l = ip.apr) === null || _l === void 0 ? void 0 : _l.apr) !== null && _m !== void 0 ? _m : 0.0) * 100.0,
                    "base": baseAPR,
                },
                "tvl": (_o = pd === null || pd === void 0 ? void 0 : pd.tvl) === null || _o === void 0 ? void 0 : _o.toNumber(),
                "rewards": rewards
            });
            console.log(`pool ${ip.id}`, {
                "savingRate": (_p = ip.savingRate) === null || _p === void 0 ? void 0 : _p.toNumber(),
                "totalShares": ip.totalShares.toNumber(),
                "collateral.ed": ip.collateral.ed.toNumber(),
                "id": ip.id,
                "name": ip.collateral.fullname,
                "symbol": ip.collateral.display,
                "apr": {
                    "reward": ((_r = (_q = ip.apr) === null || _q === void 0 ? void 0 : _q.apr) !== null && _r !== void 0 ? _r : 0.0) * 100.0,
                    "base": baseAPR,
                },
                "tvl": (_s = pd === null || pd === void 0 ? void 0 : pd.tvl) === null || _s === void 0 ? void 0 : _s.toNumber(),
                "rewards": rewards
            });
            const token0 = ip.collateral.display.split(" ")[1].split("-")[0];
            const token1 = ip.collateral.display.split(" ")[1].split("-")[1];
            (_t = database_service_1.collections.farms) === null || _t === void 0 ? void 0 : _t.findOneAndUpdate({
                "id": ip.id,
                "chef": "incentives-dex-dexshare",
                "chain": "Karura",
                "protocol": "Karura DEX",
            }, {
                "$set": {
                    "id": ip.id,
                    "chef": "incentives-dex-dexshare",
                    "chain": "Karura",
                    "protocol": "Karura DEX",
                    "farmType": "StandardAmm",
                    "farmImpl": "Pallet",
                    "asset": {
                        "symbol": ip.collateral.display.split(" ").reverse().join(" "),
                        "address": ip.id,
                        "price": 0.0,
                        "logos": [
                            `https://raw.githubusercontent.com/yield-bay/assets/main/list/${token0}.png`,
                            `https://raw.githubusercontent.com/yield-bay/assets/main/list/${token1}.png`,
                        ],
                    },
                    "tvl": (_u = pd === null || pd === void 0 ? void 0 : pd.tvl) === null || _u === void 0 ? void 0 : _u.toNumber(),
                    "apr.reward": ((_w = (_v = ip.apr) === null || _v === void 0 ? void 0 : _v.apr) !== null && _w !== void 0 ? _w : 0.0) * 100.0,
                    "apr.base": baseAPR,
                    "rewards": rewards,
                    "allocPoint": 1,
                    "lastUpdatedAtUTC": new Date().toUTCString(),
                }
            }, {
                upsert: true
            }).then(r => {
                console.log("incentives-dex-dexshare");
            }).catch(e => {
                console.log("error incentives-dex-dexshare", e);
            });
        }
    });
};
exports.runKaruraTask = runKaruraTask;
