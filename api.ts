import { logWithTime, timestamp, wait } from '@vmoe/node-utils'
import { request } from '@vmoe/node-utils/axios'
import { fs } from '@vmoe/node-utils/fs'

const pkg = JSON.parse(await fs.readFile('./package.json', 'utf-8'))

export function createURL(
  link: string,
  type: string | number = 1,
  endId: number | string = 0,
  page: number = 1,
  size: number = 10,
  useProxy = false
) {
  const url = new URL(link)

  url.searchParams.set('size', String(size))
  url.searchParams.set('page', String(page))
  url.searchParams.set('gacha_type', String(type))
  url.searchParams.set('end_id', String(endId))

  if (useProxy) {
    const host = url.host
    url.host = 'proxy.viki.moe'
    url.searchParams.set('proxy-host', host)
  }

  return url.href
}

export const gacha = {
  1: '群星跃迁',
  2: '新手跃迁',
  11: '限定跃迁',
  12: '光锥跃迁'
} as const

export async function fetchRecordsByGachaType(
  link: string,
  type: number | string,
  useProxy = false
) {
  let page = 1

  logWithTime(`开始获取 第 ${page} 页...`)
  const { data } = await request(createURL(link, type, 0, page, 10, useProxy))
  const result = []

  if (!data.data?.list) {
    logWithTime('链接可能已失效，请重新抓取！')
    process.exit(1)
  }

  result.push(...data.data.list)

  let endId = result[result.length - 1].id

  while (true) {
    page += 1
    await wait(200)
    logWithTime(`开始获取 第 ${page} 页...`)
    const { data } = await request(createURL(link, type, endId, page, 10, useProxy))

    if (!data?.data || data?.data?.list?.length === 0) {
      break
    }

    result.push(...data.data.list)
    endId = result[result.length - 1].id
  }

  return result
}

export async function fetchGachaRecords(link: string, useProxy = false) {
  let uid: string = ''
  let lang: string = ''
  const list = []

  for (const [type, name] of Object.entries(gacha)) {
    logWithTime(`开始获取 「${name}」 跃迁记录...`)

    const rawRecords = await fetchRecordsByGachaType(link, type, useProxy)

    const records = rawRecords.map(e => {
      if (!uid) uid = e.uid
      if (!lang) lang = e.lang

      delete e.uid
      delete e.lang
    })

    list.push(...records)

    logWithTime(`共获取到 ${records.length} 条 「${name}」 记录`)
  }

  return { list, uid, lang }
}

export async function fetchUigfRecords(link: string, useProxy = false) {
  const { uid, lang, list } = await fetchGachaRecords(link, useProxy)

  if (!uid) {
    return null
  }

  const info = {
    uid,
    lang,
    region_time_zone: 8,
    export_timestamp: timestamp(),
    export_app: pkg?.name,
    export_app_version: `v${pkg?.version}`,
    srgf_version: 'v1.0'
  }

  return { info, list } as const
}
