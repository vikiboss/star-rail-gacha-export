import { logWithTime } from '@vmoe/node-utils'
import { fs } from '@vmoe/node-utils/fs'
import prompts from '@vmoe/node-utils/prompts'

import { fetchUigfRecords } from './api'

const { url, useProxy } = await prompts([
  { type: 'text', name: 'url', message: '请输入抽卡链接' },
  {
    type: 'confirm',
    name: 'useProxy',
    message: '是否使用代理域名获取记录？（如果域名被屏蔽可以开启）'
  }
])

const res = await fetchUigfRecords(url, useProxy)

if (!res) {
  logWithTime('获取失败，链接无效或已过期，请重新抓取')
  process.exit(1)
}

await fs.writeFile(
  `./star-rail-${res.info.uid}-${res.info.export_timestamp}.json`,
  JSON.stringify(res),
  'utf-8'
)

logWithTime('跃迁记录已成功导出到 list.json 文件！')
