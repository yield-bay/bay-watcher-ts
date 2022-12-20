import { ethers, Signer, utils } from "ethers";

import { collections } from '../services/database.service';

export const runNftTask = async () => {

    const abi = [
        "function owns(address) external view returns (bool)",
        "function batchGift(address[], string)",
        "function gift(address, string)",
        "function balanceOf(address) external view returns (uint256)",
        "function ownerOf(uint256) external view returns (address)",
    ]

    const privateKey = process.env.PRIVATE_KEY ?? "0x0";
    const provider = new ethers.providers.JsonRpcProvider(process.env.MOONBEAM_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    let moonbeam_baynft = "0x546f3282A46E70A30e6Fa001Aed13E68669BC29D";
    let baynft: any = new ethers.Contract(moonbeam_baynft, abi, wallet as unknown as Signer);

    let ucres: any[] = await collections.users?.find({
        "users_brought": { "$gt": 5 },
        "owns_nft": false,
    }).toArray() as unknown as any[]
    console.log("ucres", ucres);

    let users: any[] = []
    let userObjs: any[] = []

    var fe = new Promise(() => {
        ucres?.forEach(async (u: any) => {
            let user_address = u.address
            let owns = await baynft.owns(user_address);
            console.log("user_address", user_address, "owns", owns);

            if (!owns) {
                users.push(user_address);
                userObjs.push(u);
            }
        })
    })

    const myAsyncLoopFunction = async (ucres: any[]) => {
        const asyncUsers = []
        const asyncUserObjs = []

        for (const u of ucres) {
            let user_address = u.address
            let owns = await baynft.owns(user_address);
            console.log("user_address", user_address, "owns", owns);

            if (!owns) {
                asyncUsers.push(user_address);
                asyncUserObjs.push(u);
            }
        }
        return [asyncUsers, asyncUserObjs]
    }
    [users, userObjs] = await myAsyncLoopFunction(ucres);


    console.log("usersl", users.length);
    if (users.length > 0) {
        let mint_res = await baynft
            .batchGift(
                users,
                "QmV8xQ5WqgZAruKu5hmtUvZcTHzWapHhTXZ73zVkuMMTZn",
            );

        console.log("mint_res", mint_res);

        userObjs.forEach((uo: any) => {
            collections.users?.findOneAndUpdate({ "address": uo.address }, { $set: { "address": uo.address, "owns_nft": true } })
        })
    }
}
