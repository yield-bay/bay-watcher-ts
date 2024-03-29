import { coins, stableCoins, stableSwapCoin } from '../coins'

const SRS4_NAME = '4Pool'
const LAY4_NAME = 'Starlay 4Pool'
const NASTR_NAME = 'nASTR/ASTR Pool'
const AVAULT_NAME = 'Avault 4Pool'
const BAI_META_NAME = 'BAI Metapool'
const OUSD_META_NAME = 'oUSD Metapool'
const PUSDT_META_NAME = 'Polkadot USDT Metapool'

const JPYC_META_NAME = 'JPYC Metapool'
const WBTC_META_NAME = 'WBTC Metapool'
const WETH_META_NAME = 'WETH Metapool'
const WBNB_META_NAME = 'WBNB Metapool'

export const PoolTypes = {
  BTC: 0,
  ETH: 1,
  USD: 2,
  DOT: 3,
  Crypto: 4,
  OTHER: 5
}

export const pools = [
  {
    name: AVAULT_NAME,
    symbol: '4ALP',
    addresses: {
      lpToken: '0x170E2e0939317D60baCEC48d7116498c882430A8',
      swap: '0xD8Bc543273B0E19eed34a295614963720c89f9e4',
      gauge: '0xa6B91ddDca40137B9442b4aD7076bF319eacC59E'
    },
    coins: stableCoins,
    ls: stableCoins,
    type: PoolTypes.USD
  },
  {
    name: SRS4_NAME,
    symbol: '4SRS',
    addresses: {
      lpToken: '0xB6Df5baFdcDCE7AEb49af6172143E1942999ef14',
      swap: '0x417E9d065ee22DFB7CC6C63C403600E27627F333',
      gauge: '0xCfd15008Df89D961611071BfC36e220204E9A3a8'
    },
    coins: stableCoins,
    ls: stableCoins,
    type: PoolTypes.USD
  },
  {
    name: NASTR_NAME,
    symbol: 'nASTR-ASTR LP',
    addresses: {
      lpToken: '0xcB274236fBA7B873FC8F154bb0475a166C24B119',
      swap: '0xEEa640c27620D7C448AD655B6e3FB94853AC01e3',
      gauge: '0xdCfFa5a92ef31DCc8979Ab44A0406859d7763c45'
    },
    coins: [coins.astr, coins.nastr],
    ls: [coins.astr, coins.nastr],
    type: PoolTypes.USD
  },
  {
    name: BAI_META_NAME,
    symbol: '4BAI',
    addresses: {
      lpToken: '0xBb47Fb5CcfFB44518D2Cbd3D1468A26329617038',
      swap: '0x290c7577D209c2d8DB06F377af31318cE31938fB',
      deposit: '0xD18aD1e2992Da974b5A8d69377e6aB3b16e30F29',
      gauge: '0xBbabf2184FbC4DFB17207E74cdB6B1587Dc158a4'
    },
    coins: [coins.bai, stableSwapCoin],
    ls: [coins.bai, ...stableCoins],
    type: PoolTypes.USD
  },
  {
    name: PUSDT_META_NAME,
    symbol: '4PUSDT',
    addresses: {
      lpToken: '0x8E12781da51480D84715ad83eE482643601d843E',
      swap: '0x8e39e47Ca4A44D4316b88727Eb4407De877a9235',
      deposit: '0x8277d2321CFEF47b508392C08177E05621511234',
      gauge: '0x8dBcd190e325d141E7698f0791792FFBb310A10e'
    },
    coins: [coins.pusdt, stableSwapCoin],
    ls: [coins.pusdt, ...stableCoins],
    type: PoolTypes.USD
  },
  {
    name: JPYC_META_NAME,
    symbol: '4JPYC',
    addresses: {
      lpToken: '0xea910845d8BB0c3b3A4F03D0A77D46A95bb762bA',
      swap: '0xEd6e10Fc171f2768D9c056260b18D814035F8266',
      deposit: '0x3cd1Fa4EeeFdf6c30E66c66A474e8E4dd509f54c',
      gauge: '0xe1762b802Cf306C60b0C2C1af991646eFc8B5C6b'
    },
    coins: [coins.jpyc, stableSwapCoin],
    underlyingCoins: [coins.jpyc, stableSwapCoin],
    ls: [coins.jpyc, ...stableCoins],
    type: PoolTypes.Crypto
  },
  {
    name: WBTC_META_NAME,
    symbol: '4WBTC',
    addresses: {
      lpToken: '0xb27157e749d1026a317139BaEf9020CA726b694f',
      swap: '0xff390905269Ac30eA640dBaBdF5960D7B860f2CF',
      deposit: '0xD25Cf814EeE54840A08Db8dfAbFE445B1DE37f0f',
      gauge: '0x7f2fbBa3dd14Ef24aFA22E92796791D9a38bFBE0'
    },
    coins: [coins.wbtc, stableSwapCoin],
    underlyingCoins: [coins.wbtc, stableSwapCoin],
    ls: [coins.wbtc, ...stableCoins],
    type: PoolTypes.Crypto
  },
  {
    name: WETH_META_NAME,
    symbol: '4WETH',
    addresses: {
      lpToken: '0xa1A56912bC682469ce1393557519659a5Fe6C3Fe',
      swap: '0x46F63Ec42eFcf972FCeF2330cC22e6ED1fCEB950',
      deposit: '0x2d5Da7c463B3E8f4CF1AF08a1aA0a5DB9BB644F7',
      gauge: '0x9e56b431AA4Bc8B8D04057977e3606A9110E479f'
    },
    coins: [coins.weth, stableSwapCoin],
    underlyingCoins: [coins.weth, stableSwapCoin],
    ls: [coins.weth, ...stableCoins],
    type: PoolTypes.Crypto
  },
  {
    name: WBNB_META_NAME,
    symbol: '4WBNB',
    addresses: {
      lpToken: '0xA5694645c380FeD521aCce3CD8FC0B2D98b30558',
      swap: '0xA82222d8b826E6a741f6cb4bFC6002c34D32fF67',
      deposit: '0xC9d4f937Fa8e0193b46817a41435a262867ff090',
      gauge: '0x941e9BEF5b558D7Ca97aBC98e0664E804A9C4B7b'
    },
    coins: [coins.wbnb, stableSwapCoin],
    underlyingCoins: [coins.wbnb, stableSwapCoin],
    ls: [coins.wbnb, ...stableCoins],
    type: PoolTypes.Crypto
  },
  {
    name: OUSD_META_NAME,
    symbol: '4oUSD',
    addresses: {
      lpToken: '0x2425947FD79cbf4C2C2deeD0246b0C9EdC65EB7D',
      swap: '0xD18AbE9bcedeb5A9a65439e604b0BE8db0bdB176',
      deposit: '0x535406b90E8Df2Cf2168E8579ea3d1D7A0e0AdDC',
      gauge: '0x5FF4735274b0C7ADf7de52768645aA08AE4bcB20'
    },
    coins: [coins.ousd, stableSwapCoin],
    underlyingCoins: [coins.ousd, stableSwapCoin],
    ls: [coins.ousd, ...stableCoins],
    type: PoolTypes.USD
  }
]

export default pools

const metaPools = [BAI_META_NAME, OUSD_META_NAME, PUSDT_META_NAME]
export const isMetaPool = (poolName: string) => metaPools.includes(poolName)

const cryptoPools = [JPYC_META_NAME, WBTC_META_NAME, WETH_META_NAME, WBNB_META_NAME]
export const isCryptoPool = (poolName: string) => cryptoPools.includes(poolName)

const nativePools = [NASTR_NAME]
export const isNativePool = (poolName: string) => nativePools.includes(poolName)

const XTriSwapPools: string | any[] = []
export const isXTriSwapPool = (poolName: any) => XTriSwapPools.includes(poolName)
