

import express from 'express'
import cors from 'cors'
import { Client, LocalAuth } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import chromium from '@sparticuz/chromium'
import QRCode from 'qrcode'
import fs from 'fs'

const app = express()

app.use(cors())
app.use(express.json())

declare global {
  // eslint-disable-next-line no-var
  var whatsappClient: Client | undefined

  var whatsappReady: boolean | undefined
}

global.whatsappReady = global.whatsappReady || false

let isInitializing = false


async function createClient() {
  return new Client({
    authStrategy: new LocalAuth({
      clientId: 'client-Bhavin',     
      dataPath: '/data/sessions',
    }),

    // webVersionCache: {
    //   type: 'remote',
    //   remotePath:
    //     'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    // },
    // webVersionCache: {
    //   type: 'none',
    // },
    puppeteer: {
      executablePath: await chromium.executablePath(),

      headless: true,

  //   args: [
  // ...chromium.args,

  // '--no-sandbox',
  // '--disable-setuid-sandbox',
  // '--disable-dev-shm-usage',
  // '--disable-gpu',
  // '--no-first-run',
  // '--no-zygote',
  // '--single-process',
  // '--disable-extensions',
  // ],

    args: [
    ...chromium.args,

    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
  ],

  timeout: 120000,
    },
  })
}



async function initializeWhatsApp() {
  if (global.whatsappClient || isInitializing) return

  isInitializing = true

  console.log('🚀 Initializing WhatsApp client...')

  try {
    const client = await createClient()

    console.log('✅ Client object created')

    // ================= QR =================
    client.on('qr', async (qr) => {
      console.log('\n================ QR EVENT ================\n')

      console.log('📱 QR received from WhatsApp')

      qrcode.generate(qr, { small: true })

      try {
        await QRCode.toFile('./qr.png', qr)

        console.log('✅ QR image saved')

        console.log(
          '🌐 Open: https://whatsapproal-maharaj-mango-production-d85a.up.railway.app/qr'

        )
      } catch (err) {
        console.log('❌ QR save failed:', err)
      }

      console.log('\n=========================================\n')
    })

   
    // ================= AUTH =================
      client.on('authenticated', async () => {
      console.log('\n🔐 AUTHENTICATED EVENT FIRED\n')

      try {
        if (fs.existsSync('./qr.png')) {
          fs.unlinkSync('./qr.png')
        }
      } catch (err) {
        console.log('❌ QR cleanup error:', err)
      }
    })



    client.on('auth_failure', (msg) => {
      console.log('❌ AUTH FAILURE:', msg)
    })

    client.on('remote_session_saved', () => {
      console.log('💾 SESSION SAVED SUCCESSFULLY')
    })

    // ================= READY =================
    client.on('ready', async () => {
      console.log('\n✅ READY EVENT FIRED\n')

      global.whatsappReady = true

      try {
        const info = client.info

        console.log('📱 WhatsApp Number:', info.wid.user)
        console.log('📱 Push Name:', info.pushname)
        // console.log('📱 Platform:', info.platform)
      } catch (err) {
        console.log('❌ Error reading client info:', err)
      }
    })

    // ================= STATE =================
    // client.on('change_state', (state) => {
    //   console.log('🔄 STATE:', state)
    // })

    // client.on('loading_screen', (percent, message) => {
    //   console.log(`⏳ Loading: ${percent}% - ${message}`)
    // })

    // ================= DISCONNECT =================
    client.on('disconnected', async (reason) => {
      console.log('❌ DISCONNECTED:', reason)

      global.whatsappReady = false

      try {
        await client.destroy()
      } catch (err) {
        console.log('❌ Destroy error:', err)
      }

      global.whatsappClient = undefined
      isInitializing = false

      console.log('🔄 Reconnecting in 10 seconds...')

      setTimeout(() => {
        initializeWhatsApp()
      }, 10000)
    })

    // ================= PROCESS ERRORS =================
    process.on('uncaughtException', (err) => {
      console.log('❌ UNCAUGHT EXCEPTION:', err)
    })

    process.on('unhandledRejection', (err) => {
      console.log('❌ UNHANDLED REJECTION:', err)
    })

    // ================= START =================
    console.log('🚀 Starting WhatsApp initialization...')

    // client.on('message', async (message) => {
    //   console.log('📩 Message:', message.body)

    //   if (message.body === 'hi') {
    //     await message.reply('hello from railway 🚀')
    //   }
    // })
    // client.on('message', async (message) => {
    //   console.log('📩 Message:', message.body)
    //   console.log('📩 From:', message.from)

    //   if (message.body.toLowerCase() === 'hi') {
    //     await client.sendMessage(
    //       message.from,
    //       'hello from railway 🚀'
    //     )

    //     console.log('✅ Reply sent')
    //   }
    // })

    await client.initialize()

    console.log('📂 Session path:', '/data/sessions')
    console.log('✅ client.initialize() completed')

    global.whatsappClient = client

    isInitializing = false
  } catch (err) {
    console.log('❌ INITIALIZE ERROR:', err)

    global.whatsappClient = undefined

    isInitializing = false

    console.log('🔄 Retrying in 10 seconds...')

    setTimeout(() => {
      initializeWhatsApp()
    }, 10000)
  }
}

initializeWhatsApp()


const PORT = process.env.PORT || 3000

app.get('/', (_, res) => {
  res.send('WhatsApp server running')
})

// app.get('/qr', (_, res) => {
//   res.sendFile(process.cwd() + '/qr.png')
// })

app.get('/qr', (_, res) => {
  res.setHeader('Cache-Control', 'no-store')

  res.sendFile(process.cwd() + '/qr.png')
})

app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    whatsappReady: global.whatsappReady,
  })
})

async function restartWhatsApp() {
  try {
    console.log('🔄 Restarting WhatsApp client...')

    global.whatsappReady = false

    if (global.whatsappClient) {
      try {
        await global.whatsappClient.destroy()
      } catch {}
    }

    global.whatsappClient = undefined

    await initializeWhatsApp()

    console.log('✅ WhatsApp restarted')
  } catch (err) {
    console.log('❌ Restart failed:', err)
  }
}

app.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'phone and message required',
      })
    }

    if (!global.whatsappClient || !global.whatsappReady) {
      return res.status(500).json({
        success: false,
        error: 'WhatsApp not ready',
      })
    }

    const cleanPhone = phone.replace(/\D/g, '').trim()

    // DIRECT CHAT ID
    const chatId = `${cleanPhone}@c.us`

    console.log('📤 Sending to:', chatId)

    let attempts = 0
    let sent = false

    while (attempts < 3 && !sent) {
      try {
        await global.whatsappClient.sendMessage(
          chatId,
          message
        )

        sent = true

        console.log('✅ WhatsApp message sent')
      } catch (err) {
        attempts++

        console.log(
          `⚠️ Send attempt ${attempts} failed`,
          err
        )

        await new Promise((resolve) =>
          setTimeout(resolve, 3000)
        )
      }
    }

    if (!sent) {
      return res.status(500).json({
        success: false,
        error: 'Failed after retries',
      })
    }

    return res.json({
      success: true,
    })
  } catch (err) {
    console.log('❌ SEND ERROR:', err)

    return res.status(500).json({
      success: false,
      error: 'Failed to send message',
    })
  }
})

// app.post('/send', async (req, res) => {
//   try {
//     const { phone, message } = req.body

//     if (!phone || !message) {
//       return res.status(400).json({
//         success: false,
//         error: 'phone and message required',
//       })
//     }

//     const cleanPhone = phone.replace(/\D/g, '').trim()

//     const chatId = `${cleanPhone}@c.us`

//     let attempts = 0

//     while (attempts < 3) {
//       try {
//         if (
//           !global.whatsappClient ||
//           !global.whatsappReady
//         ) {
//           throw new Error('WhatsApp not ready')
//         }

//         console.log('📤 Sending to:', chatId)

//         await global.whatsappClient.sendMessage(
//           chatId,
//           message
//         )

//         console.log('✅ WhatsApp message sent')

//         return res.json({
//           success: true,
//         })
//       } catch (err: any) {
//         attempts++

//         console.log(
//           `⚠️ Send attempt ${attempts} failed`,
//           err
//         )

//         // DETACHED FRAME FIX
//         if (
//           err?.message?.includes('detached Frame') ||
//           err?.message?.includes('Target closed') ||
//           err?.message?.includes('Session closed')
//         ) {
//           console.log(
//             '♻️ Chromium crashed, restarting WhatsApp...'
//           )

//           await restartWhatsApp()

//           // WAIT FOR READY
//           await new Promise((resolve) =>
//             setTimeout(resolve, 15000)
//           )
//         } else {
//           await new Promise((resolve) =>
//             setTimeout(resolve, 3000)
//           )
//         }
//       }
//     }

//     return res.status(500).json({
//       success: false,
//       error: 'Failed after retries',
//     })
//   } catch (err) {
//     console.log('❌ SEND ERROR:', err)

//     return res.status(500).json({
//       success: false,
//       error: 'Failed to send message',
//     })
//   }
// })

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

