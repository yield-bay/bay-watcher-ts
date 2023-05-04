import { rpc, types, runtime } from '@oak-network/types';
import { ApiPromise, WsProvider } from '@polkadot/api';

import { collections } from '../services/database.service';

export const runTuringTask = async () => {
    const api = await ApiPromise.create({
        provider: new WsProvider("wss://rpc.turing.oak.tech"),
        rpc,
        types,
        runtime,
    });
    const aces = collections.autocompoundEvents?.find({
        "status": "RUNNING",
        "chain": "KUSAMA",
    }).toArray() as unknown as any[]

    const events = await aces;
    console.log("aces", events)

    events.forEach(async (e) => {
        console.log("ee", e.userAddress, e.chain, e.taskId);

        const acs = await api.query.automationTime.accountTasks(
            e.userAddress,
            e.taskId
        )
        const task: any = acs.toHuman()
        console.log("acs", acs, "task", task)

        const etslen = task?.schedule?.Fixed?.executionTimes?.length
        const executionsLeft = task?.schedule?.Fixed?.executionsLeft
        console.log("etslen", etslen, "executionsLeft", executionsLeft);

        const lastExecTime = parseInt(task?.schedule?.Fixed?.executionTimes[etslen - 1].replaceAll(",", ""), 10)

        console.log("lastExecTime", lastExecTime);
        console.log("now", Math.floor(Date.now() / 1000));
        if ((executionsLeft < etslen && (lastExecTime < Math.floor(Date.now() / 1000))) || task == null) {
            console.log("here it is")

            collections.xcmpTasks?.findOneAndUpdate({
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
