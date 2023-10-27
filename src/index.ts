/**
 * @name Chatbot-SILI 万界规划局QQ机器人
 * @author Dragon-Fish <dragon-fish@qq.com>
 *
 * @license MIT
 */

const PROD = process.env.NODE_ENV === 'production'
import { config } from 'dotenv'
import { resolve } from 'path'
import { App, type Session, Random, Time, Dict } from 'koishi'

// Services
import { HTMLService } from './utils/RenderHTML'

// Plugins
import PatchCallme from './plugins/callme'
import PluginAbout from './plugins/about'
import PluginDatabaseAdmin from './plugins/dbadmin'
import PluginDice from './plugins/dice'
import PluginHljs from './plugins/hljs'
import PluginMediawiki from './plugins/mediawiki'
import PluginMute from './plugins/mute'
import PluginOpenAi from './plugins/openai'
import PluginPing from './plugins/ping'
import PluginPixiv from './plugins/pixiv'
import PluginPowerUser from './plugins/powerUser'
import PluginProfile from './plugins/profile'
import PluginQueue from './plugins/queue'
import PluginReboot from './plugins/reboot'
import PluginSensitiveFilter from './plugins/sensitive-words-filter'
import PluginSiliName from './plugins/siliName'
import PluginSpawn from './plugins/spawn'
import PluginSticker from './plugins/sticker'
import PluginVerifyFandomUser from './plugins/verifyFandomUser'
import PluginVersion from './plugins/version'
import PluginWebShot from './plugins/webshot'
import PluginWhoAsked from './plugins/whoAsked'
import PluginYoudao from './plugins/youdao'

// Modules
// import FandomDiscordConnect from './modules/FandomDiscordConnect'
import MessagesLogger from './modules/MessagesLogger'
import MintFilterService from './plugins/sensitive-words-filter/MintFilterService'
import MgpGroupUtils from './modules/MoegirlGroupUtils'
import ProcessErrorHandler from './modules/ProcessErrorHandler'

// 这些导入的顺序之后慢慢调整吧，太尼玛多了
import PluginMongo from '@koishijs/plugin-database-mongo'
import AdapterRed from 'koishi-plugin-adapter-red'
import AdapterDiscord from '@koishijs/plugin-adapter-discord'
import AdapterDingtalk from '@koishijs/plugin-adapter-dingtalk'
import AdapterVilla from 'koishi-plugin-adapter-villa'
import * as PluginHelp from '@koishijs/plugin-help'
import PluginCommands from '@koishijs/plugin-commands'
import * as PluginSwitch from 'koishi-plugin-switch'
import PluginAssetsS3 from 'koishi-plugin-assets-s3'
import * as PluginAdmin from '@koishijs/plugin-admin'
import * as PluginBind from '@koishijs/plugin-bind'
import * as PluginBroadcast from '@koishijs/plugin-broadcast'
import * as PluginCallme from '@koishijs/plugin-callme'
import * as PluginEcho from '@koishijs/plugin-echo'
import * as PluginRateLimit from 'koishi-plugin-rate-limit'
import * as PluginRecall from 'koishi-plugin-recall'
import * as PluginRepeater from 'koishi-plugin-repeater'
import * as PluginBaidu from 'koishi-plugin-baidu'
import * as PluginGithub from 'koishi-plugin-github'
import * as PluginImageSearch from 'koishi-plugin-image-search'
import * as PluginSchedule from 'koishi-plugin-schedule'
import * as PluginDialogueAuthor from 'koishi-plugin-dialogue-author'
import * as PluginDialogueContext from 'koishi-plugin-dialogue-context'
import * as PluginDialogueFlow from 'koishi-plugin-dialogue-flow'
import * as PluginDialogueRateLimit from 'koishi-plugin-dialogue-rate-limit'
import * as PluginDialogue from 'koishi-plugin-dialogue'
import PluginConsole from '@koishijs/plugin-console'
import * as PluginAnalytics from '@koishijs/plugin-analytics'
import PluginAuth from '@koishijs/plugin-auth'
import PluginDataview from '@koishijs/plugin-dataview'
import PluginExplorer from '@koishijs/plugin-explorer'
import PluginInsight from '@koishijs/plugin-insight'
import * as PluginLogger from '@koishijs/plugin-logger'
import * as PluginStatus from '@koishijs/plugin-status'
import * as PluginSandbox from '@koishijs/plugin-sandbox'
import PluginPuppeteer from 'koishi-plugin-puppeteer'

// Setup .env
config()
config({
  path: resolve(__dirname, '..', PROD ? '.env.production' : '.env.development'),
  override: true,
})

const { env } = process

/** 初始化 Koishi 实例 */
const app = new App({
  // port: env.KOISHI_PROT ? +env.KOISHI_PROT : undefined,
  // selfUrl: env.KOISHI_SELF_URL,
  nickname: env.KOISHI_NICKNAME?.split('|'),
  prefix: (ctx) => {
    const items = env.KOISHI_PREFIX?.split('|') || []
    if (ctx.platform === 'villa') items.unshift('/')
    return items
  },
})

const logger = app.logger('INIT')

/** 安装数据库 */
app.plugin(PluginMongo, {
  host: env.DB_MONGO_HOST,
  port: Number(env.DB_MONGO_PORT),
  // username: env.DB_MONGO_USER,
  // password: env.DB_MONGO_PASSWORD,
  database: env.DB_MONGO_DATABASE,
})

/** 安装适配器 */
app.plugin(function PluginCollectionAdapters(ctx) {
  // QQ
  //  ctx.plugin('adapter-onebot', {
  //    protocol: env.ONEBOT_PROTOCOL,
  //    selfId: env.ONEBOT_SELFID,
  //    endpoint: env.ONEBOT_ENDPOINT,
  //  })
  ctx.plugin(AdapterRed, {
    endpoint: env.CHRONOCAT_ENDPOINT,
    token: env.CHRONOCAT_TOKEN,
    selfId: env.ONEBOT_SELFID?.trim(),
    path: '/assets/red',
    selfUrl: env.KOISHI_SELF_URL,
  })

  // Discord
  // ctx.plugin(AdapterDiscord, {
  //   token: env.TOKEN_DISCORD_BOT,
  // })

  // DingTalk
  const dingTokens = process.env.DINGTALK_TOKENS?.split('|')
  // if (dingTokens && dingTokens.length) {
  //   dingTokens.forEach((token) => {
  //     const [agentId, appkey, secret] = token?.split('/')
  //     if (!agentId || !appkey || !secret) return
  //     ctx.plugin(AdapterDingtalk, {
  //       protocol: 'ws',
  //       agentId: +agentId,
  //       appkey,
  //       secret,
  //     })
  //   })
  // }

  // Villa
  ctx.plugin(AdapterVilla, {
    id: process.env.VILLA_APPID,
    secret: process.env.VILLA_APPSECRET,
    pubKey: process.env.VILLA_PUBKEY,
    path: '/api/callback/villa',
    emoticon: undefined,
    transfer: undefined,
    /**
     * @TODO: `underscores_in_headers on;` should be set in nginx config
     */
    verifyCallback: true,
  })

  // Repl
  // ctx.plugin('adapter-repl')
})

/** 安装插件 */
// @pollify v3 自带的指令
app.plugin(function PluginCollectionLegacy(ctx) {
  // [core]
  ctx.plugin(function PluginCollectionLegacyCore(ctx) {
    ctx.plugin(PluginHelp)
    ctx.command('help').alias('帮助')
    ctx.plugin(PluginCommands)
    ctx.plugin(PluginSwitch)
    ctx.plugin(PluginAssetsS3, {
      credentials: {
        accessKeyId: env.TOKEN_S3_ACCESS_KEY_ID,
        secretAccessKey: env.TOKEN_S3_ACCESS_KEY_SECRET,
      },
      bucket: env.TOKEN_S3_BUCKET,
      pathPrefix: env.KOISHI_ENV === 'prod' ? 'v4/assets/' : 'v4-dev/assets/',
      publicUrl: `${env.TOKEN_S3_PUBLIC_URL}/${
        env.KOISHI_ENV === 'prod' ? 'v4/assets/' : 'v4-dev/assets/'
      }`,
      region: env.TOKEN_S3_REGION,
      endpoint: env.TOKEN_S3_ENDPOINT,
    })
  })
  // [common]
  ctx.plugin(function PluginCollectionLegacyCommon(ctx) {
    ctx.plugin(PluginAdmin) // channel user auth
    ctx.plugin(PluginBind)
    ctx.plugin(PluginBroadcast)
    ctx.plugin(PluginCallme)
    ctx.plugin(PluginEcho)
    ctx.command('echo', { authority: 3 })
    ctx.plugin(PluginRateLimit)
    ctx.plugin(PluginRecall)
    const randomHit = (probability: number) => Math.random() < probability
    ctx.plugin(PluginRepeater, {
      onRepeat(state: RepeatState, session: Session) {
        if (!state.repeated && state.times > 3) {
          const hit = randomHit(0.125 * state.times)
          logger.info('[尝试参与复读]', hit)
          return hit ? state.content : ''
        }

        const noRepeatText = [
          'No，不要再复读了！',
          '🤚我说婷婷，你们搞复读，不讲武德。',
          '那么就到此为止吧，再复读就不礼貌了。',
          '🤚很抱歉打扰大家的复读，水群不要忘记多喝热水哟~',
        ]
        if (
          state.repeated &&
          state.times > 5 &&
          !noRepeatText.includes(state.content)
        ) {
          const hit = randomHit(0.1 * (state.times - 5))
          logger.info('[尝试打断复读]', hit)
          return hit ? Random.pick(noRepeatText) : ''
        }
      },
      // onInterrupt(state: RepeatState, session: Session) {
      //   if (!state.repeated) return
      //   const hit = randomHit(0.1 * (state.times - 5))
      //   logger.info('[尝试质询打断]', hit)
      //   return hit
      //     ? session.send(
      //         `${segment.at(session.userId as string)}在？为什么打断复读？`
      //       )
      //     : false
      // },
    })
  })
  // [tools]
  ctx.plugin(function PluginCollectionLegacyTools(ctx) {
    ctx.plugin(PluginBaidu)
  })
})

// 网页控制台
app.plugin(function PluginCollectionConsole(ctx) {
  ctx.plugin(PluginConsole, {
    title: 'SILI 监控中心',
    uiPath: '/dash',
    apiPath: '/api/status',
  })
  ctx.plugin(PluginAnalytics)
  ctx.plugin(PluginAuth, { admin: { enabled: false } })
  ctx.plugin(PluginDataview)
  ctx.plugin(PluginExplorer)
  ctx.plugin(PluginInsight)
  ctx.plugin(PluginLogger)
  ctx.plugin(PluginStatus)
  ctx.plugin(PluginSandbox)
})

// 第三方
app.plugin(async function PluginCollectionThirdParty(ctx) {
  ctx.plugin(PluginGithub, {
    path: '/api/github',
    appId: env.TOKEN_GITHUB_APPID,
    appSecret: env.TOKEN_GITHUB_APPSECRET,
    replyTimeout: 12 * Time.hour,
    replyFooter: '',
  })
  ctx.plugin(PluginImageSearch, {
    saucenaoApiKey: env.TOKEN_SAUCENAO_APIKEY,
  })
  ctx.plugin(PluginPuppeteer, {
    // headless: 'new',
  })
  ctx.plugin(PluginSchedule)
})

app.plugin(function PluginCollectionDialogue(ctx) {
  ctx.plugin(PluginDialogue, {
    prefix: env.KOISHI_ENV === 'prod' ? '?!' : '#',
    throttle: {
      responses: 10,
      interval: 1 * Time.minute,
    },
    preventLoop: {
      length: 3,
      participants: 1,
      debounce: 3 * Time.minute,
    },
  })
  ctx.plugin(PluginDialogueAuthor)
  ctx.plugin(PluginDialogueContext)
  // ctx.plugin(PluginDialogueFlow)
  ctx.plugin(PluginDialogueRateLimit)
})

// SILI Core
app.plugin(function PluginCollectionSILICore(ctx) {
  ctx.plugin(PluginAbout)
  ctx.plugin(PluginDice)
  ctx.plugin(PluginHljs)
  ctx.plugin(PluginMute)
  ctx.plugin(PluginOpenAi, {
    openaiOptions: {
      baseURL: env.OPENAI_BASE_RUL,
      apiKey: env.OPENAI_API_KEY,
    },
    maxTokens: 500,
    recordsPerChannel: 50,
  })
  ctx.plugin(PluginPing)
  ctx.plugin(PluginPixiv, {
    baseURL: env.API_PIXIV_BASE,
    pximgURL: env.API_PIXIV_IMG,
  })
  ctx.plugin(PluginPowerUser)
  ctx.plugin(PluginProfile)
  ctx.plugin(PluginQueue)
  ctx.plugin(PluginSiliName)
  ctx.plugin(PluginSticker)
  ctx.plugin(PluginVerifyFandomUser)
  ctx.plugin(PluginVersion)
  ctx.plugin(PluginWebShot)
  ctx.plugin(PluginWhoAsked)
  ctx.plugin(PluginYoudao)

  // MediaWiki
  ctx.plugin(PluginMediawiki, {
    searchIfNotExist: true,
    showDetailsByDefault: true,
  })
  ctx.command('wiki.connect').config.authority = 2
})

// Internal utils
app.plugin(function PluginCollectionInternal(ctx) {
  ctx.command('admin', '维护指令集')
  ctx.command('tools', '实用工具集')
  // ctx.plugin(FandomDiscordConnect)
  ctx.plugin(HTMLService)
  ctx.plugin(MessagesLogger)
  ctx.plugin(MintFilterService)
  ctx.plugin(MgpGroupUtils)
  ctx.plugin(PatchCallme)
  ctx.plugin(ProcessErrorHandler)
  ctx.plugin(PluginDatabaseAdmin)
  ctx.plugin(PluginReboot)
  ctx.plugin(PluginSensitiveFilter)
  ctx.plugin(PluginSpawn, { shell: 'pwsh' })
})

/** 启动应用程序 */
app.start().then(() => {
  logger.info('🌈', 'SILI启动成功~')
})

// Types
interface RepeatState {
  content: string
  repeated: boolean
  times: number
  users: Dict<number>
}
