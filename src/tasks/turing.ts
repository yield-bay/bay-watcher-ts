import { rpc, types, runtime } from '@oak-network/types';
import { ApiPromise, WsProvider } from '@polkadot/api';

import { collections } from '../services/database.service';

export const runTuringTask = async () => {
    const api = await ApiPromise.create({
        provider: new WsProvider("wss://rpc.turing-staging.oak.tech"),
        rpc,
        types,
        runtime,
    });
    const aces = collections.autocompoundEvents?.find({
        "status": "RUNNING",
    }).toArray() as unknown as any[]

    const events = await aces;

    events.forEach(async (e) => {
        console.log("ee", e.userAddress, e.chain, e.taskId);

        const acs = await api.query.automationTime.accountTasks(
            e.userAddress,
            e.taskId
        )
        const task: any = acs.toHuman()
        const etslen = task?.schedule?.Fixed?.executionTimes?.length
        console.log("etslen", etslen);

        const lastExecTime = parseInt(task?.schedule?.Fixed?.executionTimes[etslen - 1].replaceAll(",", ""), 10)

        console.log("lastExecTime", lastExecTime);
        console.log("now", Math.floor(Date.now() / 1000));
        if (lastExecTime > Math.floor(Date.now() / 1000)) {
            collections.autocompoundEvents?.findOneAndUpdate({
                "userAddress": e.userAddress,
                "chain": e.chain,
                "taskId": e.taskId
            }, {
                "$set": {
                    "status": "FINISHED"
                }
            }, {
                upsert: true
            }).then(r => {
                console.log("turing staging");
            }).catch(e => {
                console.log("error turing staging", e);
            })
        }
    });
}
