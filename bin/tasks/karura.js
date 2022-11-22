"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runKaruraTask = void 0;
const api_1 = require("@polkadot/api");
const rpc_provider_1 = require("@polkadot/rpc-provider");
const api_2 = require("@acala-network/api");
const sdk_1 = require("@acala-network/sdk");
const runKaruraTask = async () => {
    const provider = new rpc_provider_1.WsProvider('wss://karura-rpc-0.aca-api.network', false);
    const api = new api_1.ApiPromise((0, api_2.options)({ provider }));
    await api.isReady;
    const wallet = new sdk_1.Wallet(api);
    await wallet.isReady;
    // console.log(
    //     `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
    // );
    // const pv = await api.query.incentives.palletVersion();
    // console.log("pv", pv);
    const ap = await api.consts.incentives.accumulatePeriod;
    console.log("ap", ap, ap);
    // const periodCount = MILLISECONDS_OF_YEAR / EXPECTED_BLOCK_TIME / ap.toNumber();
    // console.log("periodCount", periodCount);
    let ict = new sdk_1.Incentive(api, wallet);
    let ips = await ict.getAllIncentivePools();
    console.log("ips", ips);
    ips.forEach((ip) => {
        var _a;
        if (ip.enable) {
            console.log("id", ip.id);
            console.log("name", ip.collateral.fullname);
            console.log("symbol", ip.collateral.display);
            console.log("apr", (_a = ip.apr) === null || _a === void 0 ? void 0 : _a.apr);
            console.log("rwrd", ip.rewards);
            ip.rewards.forEach(reward => {
                console.log("name", reward.rewardToken.name);
                console.log("amount", reward.totalReward.toNumber(), reward.totalReward.toNumber(), reward.totalReward._getInner().toNumber());
            });
        }
    });
};
exports.runKaruraTask = runKaruraTask;
