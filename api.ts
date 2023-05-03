import { logWithTime, wait } from '@vmoe/node-utils'
import { request } from '@vmoe/node-utils/axios'

export function createURL(
  link: string,
  type: string | number = 1,
  endId: number | string = 0,
  page: number = 1,
  size: number = 10
) {
  const url = new URL(link)

  url.searchParams.set('size', String(size))
  url.searchParams.set('page', String(page))
  url.searchParams.set('gacha_type', String(type))
  url.searchParams.set('end_id', String(endId))

  return url.href
}

export const gacha = {
  1: '群星跃迁',
  2: '新手跃迁',
  11: '限定跃迁',
  12: '光锥跃迁'
} as const

export async function fetchTypeRecords(link: string, type: number | string) {
  let page = 1

  const { data } = await request(createURL(link, type, 0, page, 10))
  const result = []

  if (!data.data?.list) {
    logWithTime('链接可能已失效，请重新抓取！')
    process.exit(1)
  }

  result.push(...data.data.list)

  let endId = result[result.length - 1].id

  while (data.data.list && data.data.list.length > 0) {
    page += 1

    logWithTime('延迟 300 毫秒...')

    await wait(300)

    const { data } = await request(createURL(link, type, page, 10, endId))

    result.push(...data.data.list)

    endId = result[result.length - 1].id
  }

  return result
}

export async function fetchGachaRecords(link: string) {
  const res = []

  for (const [type, _] of Object.entries(gacha)) {
    const records = await fetchTypeRecords(link, type)
    res.push(records)
  }

  return res
}
