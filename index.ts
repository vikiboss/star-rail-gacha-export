import { colors, logWithTime } from '@vmoe/node-utils'
import { fs } from '@vmoe/node-utils/fs'
import prompts from '@vmoe/node-utils/prompts'

import { fetchSrgfRecords } from './api'

const { url, useProxy } = await prompts([
  { type: 'text', name: 'url', message: '请输入跃迁链接（获取方式参考 README 说明）' },
  {
    type: 'confirm',
    name: 'useProxy',
    message: '是否使用代理域名获取记录？（如果域名被屏蔽可以开启）'
  }
])

if (!url || !/^\s*https?:\/\//.test(url)) {
  logWithTime('不是合法的链接，请重新输入！')
  process.exit(1)
}

const res = await fetchSrgfRecords(url.trim(), useProxy)

if (!res) {
  logWithTime('获取失败，链接无效或已过期，请重新抓取')
  process.exit(1)
}

const filename = `./star-rail-${res.info.uid}-${res.info.export_timestamp}.json`

await fs.writeFile(filename, JSON.stringify(res, null, 2), 'utf-8')

logWithTime(colors.green(`总计 ${res.list.length} 条数据，已导出到 ${filename}`))
