# bay-watcher-ts

The secondary ETL service for Yield Bay. This is used to index protocols which offer APIs in TypeScript.

## Getting Started

- Use the same database which was set up for [bay-watcher](https://github.com/yield-bay/bay-watcher)
- Copy sample env file `cp .env.sample .env` and set env variables.
- `yarn install`
- `yarn build`
- `yarn start`

## Integration Details

- The integrations are done inside [src/tasks](src/tasks) directory.
- The Karura and Mangata protocols had SDKs only in TypeScript, so we included them here.
- Sirius has their own API to compute farm data, so we used some of their code here. (We also have an open [PR](https://github.com/SiriusFinance/Exchange/pull/1) in their repo).
- Arthswap Single Staking farm is also implemented here, due to some issue with ethers-rs not working properly with a particular solidity function.
- We run all the tasks every 5 minutes, as shown in [src/main.ts](src/main.ts).
