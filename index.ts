import { logWithTime, wait } from '@vmoe/node-utils'
import { fs } from '@vmoe/node-utils/fs'
import { request } from '@vmoe/node-utils/axios'
import prompts from '@vmoe/node-utils/prompts'

import { authKey } from './env'
import { createURL } from './api'

const { url, useProxy } = await prompts([
  { type: 'text', name: 'url', message: '请输入抽卡链接' },
  {
    type: 'confirm',
    name: 'useProxy',
    message: '是否使用代理获取记录？（不知道就默认选否）'
  }
])

createURL(url)

function generateUrl(type: number, page: number, size = 10, authKey: string, end_id = 0) {
  authKey = encodeURIComponent(authKey)
  return `https://proxy.viki.moe/common/gacha_record/api/getGachaLog?authkey_ver=1&default_gacha_type=11&lang=zh-cn&authkey=${authKey}&game_biz=hkrpg_cn&page=${page}&size=${size}&gacha_type=${type}&end_id=${end_id}&proxy-host=api-takumi.mihoyo.com`
}

// const res = []

// for (const [type, _] of Object.entries(gacha)) {
//   const records = await getRecords(Number(type), authKey)
//   res.push(records)
// }

// await fs.writeFile('./list.json', JSON.stringify(res, null, 2))

// logWithTime('跃迁记录已成功导出到文件 list.json')
