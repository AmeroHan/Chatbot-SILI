import { Context, Logger, Service } from 'koishi'
import { readFile } from 'fs/promises'
import Mint from 'mint-filter'
import { resolve } from 'path'

const logger = new Logger('MintFilter')

declare module 'koishi' {
  interface Context {
    mint: Mint
  }
}

export default class MintFilterService {
  constructor(public ctx: Context) {
    this.start()
  }
  protected async start() {
    const start = Date.now()
    logger.info('filter build start')
    const text = await readFile(resolve(__dirname, './badwords.ini'))
      .then((val) => val.toString())
      .catch((e) => {
        this.ctx.logger('MintFilter').warn('Failed to load badwords.ini', e)
        return ''
      })
    const words = text
      .split('\n')
      .map((i) => i.trim())
      .filter((i) => !!i && !i.startsWith('//') && !i.startsWith('#'))
    this.ctx.root.provide('mint')
    this.ctx.root.mint = new Mint(words)
    logger.info(
      `filter loaded ${words.length} words in ${Date.now() - start}ms`
    )
  }
}
