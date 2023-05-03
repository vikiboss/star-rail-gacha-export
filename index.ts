import { fs } from '@vmoe/node-utils/fs'
import { logWithTime } from '@vmoe/node-utils'
import { request } from '@vmoe/node-utils/axios'

import { authKey } from './env'

const gacha = {
  11: '限定跃迁',
  12: '光锥跃迁',
  1: '群星跃迁',
  2: '新手跃迁'
}

export async function getRecords(type: number | string = 11, authKey) {
  let page = 1
  let url = getRecordUrl(type, page, 10, authKey)
  let { data } = await request(url)
  const result = []

  if (!data.data?.list) {
    logWithTime('authkey 失效')
    process.exit(1)
  }

  result.push(...data.data.list)

  page++
  let endId = result[result.length - 1].id
  while (data.data.list && data.data.list.length > 0) {
    await new Promise(resolve => setTimeout(resolve, 300))
    logWithTime('休息一秒，继续拉取抽卡记录')
    url = getRecordUrl(type, page, 20, authKey, endId)
    page++
    data = (await request(url)).data
    result.push(...data.data.list)
    endId = result[result.length - 1].id
  }
  logWithTime('抽卡记录拉取完成')
  return result
}

export async function statistics(type = 11, authKey) {
  let records = await getRecords(type, authKey)

  let total = records.length
  let rarity5Num = records.filter(item => item.rank_type === '5').length
  let rarity4Num = records.filter(item => item.rank_type === '4').length
  let rarity5Rate = ((rarity5Num / total) * 100).toFixed(2) + '%'
  let rarity4Rate = ((rarity4Num / total) * 100).toFixed(2) + '%'
  let events = []
  let rarity5Until = 0
  let rarity4Until = 0
  records.reverse().forEach(record => {
    if (record.rank_type === '5') {
      events.push({
        name: record.name,
        time: record.time,
        until: rarity5Until,
        rarity: 5
      })
      rarity5Until = 0
      rarity4Until = 0
    } else {
      rarity5Until++
    }
    if (record.rank_type === '4') {
      events.push({
        name: record.name,
        time: record.time,
        until: rarity4Until,
        rarity: 4
      })
      rarity4Until = 0
    } else {
      rarity4Until++
    }
  })
  events = events.reverse()
  return {
    total,
    rarity5Num,
    rarity4Num,
    rarity5Rate,
    rarity4Rate,
    events,
    rarity5Until
  }
}

function getRecordUrl(type, page, size = 10, authKey, end_id = 0) {
  authKey = encodeURIComponent(authKey)
  return `https://proxy.viki.moe/common/gacha_record/api/getGachaLog?authkey_ver=1&default_gacha_type=11&lang=zh-cn&authkey=${authKey}&game_biz=hkrpg_cn&page=${page}&size=${size}&gacha_type=${type}&end_id=${end_id}&proxy-host=api-takumi.mihoyo.com`
}

const res = []

for (const [type, _] of Object.entries(gacha)) {
  const records = await getRecords(type, authKey)
  res.push(records)
}

await fs.writeFile('./list.json', JSON.stringify(res, null, 2))
