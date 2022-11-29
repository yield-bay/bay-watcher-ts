import memoize from 'memoizee'
import { IS_DEV } from '../constants/AppConstants'

const formatJsonSuccess = (data: any) => ({ ok: true, data })

const formatJsonError = (err: { toString: () => any }) => ({ ok: false, err: err.toString?.() || err })

const addGeneratedTime = async (res: any) => ({ ...(await res), generatedTimeMs: +Date.now() })

const fn = (cb: (arg0: any) => any, options: any = {}) => {
  const {
    maxAge: maxAgeSec = null // Caching duration, in seconds
  } = options

  const callback =
    maxAgeSec !== null
      ? memoize(async query => addGeneratedTime(cb(query)), {
        promise: true,
        maxAge: maxAgeSec * 1000,
        normalizer: ([query]) => JSON.stringify(query) // Separate cache entries for each route & query params,
      })
      : async (query: any) => addGeneratedTime(cb(query))

  const apiCall = async (req: { query: any }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { ok: boolean; data?: any; err?: any }): void; new(): any } } }) =>
    Promise.resolve(callback(req.query))
      .then(data => {
        if (maxAgeSec !== null) res.setHeader('Cache-Control', `max-age=0, s-maxage=${maxAgeSec}, stale-while-revalidate`)
        res.status(200).json(formatJsonSuccess(data))
      })
      .catch(err => {
        if (IS_DEV) throw err
        res.status(500).json(formatJsonError(err))
      })

  apiCall.straightCall = callback

  return apiCall
}

export { fn, formatJsonError }
