

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

  // eslint-disable-next-line no-var
  var whatsappReady: boolean | undefined
}

global.whatsappReady = global.whatsappReady || false

let isInitializing = false

async function createClient() {
  return new Client({
    authStrategy: new LocalAuth({
      clientId: 'royal-maharaja-mango',
    }),

    puppeteer: {
      executablePath: await chromium.executablePath(),

      headless: true,

      // args: [
      //   ...chromium.args,
      //   '--no-sandbox',
      //   '--disable-setuid-sandbox',
      // ],
      args: [
    ...chromium.args,
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--single-process',
    '--no-zygote',
  ]
    },
  })
}



// async function initializeWhatsApp() {
//   if (global.whatsappClient || isInitializing) return

//   isInitializing = true

//   console.log('🚀 Initializing WhatsApp client...')

//   const client = await createClient()

//   client.on('qr', async (qr) => {
//     console.log('\n📱 Scan this QR with WhatsApp:\n')

//     // terminal qr
//     qrcode.generate(qr, { small: true })

//     // browser qr image
//     await QRCode.toFile('./qr.png', qr)

//     console.log('✅ QR saved as qr.png')
//   })

//   client.on('authenticated', () => {
//     console.log('🔐 WhatsApp authenticated')
//   })

//   client.on('ready', () => {
//     console.log('✅ WhatsApp client ready!')
//     global.whatsappReady = true
//   })

//   client.on('disconnected', (reason) => {
//     console.log('❌ WhatsApp disconnected:', reason)
//     global.whatsappReady = false
//   })

//   await client.initialize()

//   global.whatsappClient = client
// }


// async function initializeWhatsApp() {
//   if (global.whatsappClient || isInitializing) return

//   isInitializing = true

//   console.log('🚀 Initializing WhatsApp client...')

//   const client = await createClient()

//   // =========================
//   // QR EVENT
//   // =========================
//   client.on('qr', async (qr) => {
//     console.log('\n================ QR EVENT ================\n')

//     console.log('📱 QR received from WhatsApp')

//     try {
//       // terminal qr
//       qrcode.generate(qr, { small: true })

//       console.log('✅ Terminal QR generated')

//       // save qr image
//       await QRCode.toFile('./qr.png', qr)

//       console.log('✅ QR image saved as qr.png')
//       console.log('🌐 Open: https://whatsapp-roal-maharaj-mango-1-3bo2.onrender.com/qr')

//       console.log('\n📲 Steps:')
//       console.log('1. Open WhatsApp on phone')
//       console.log('2. Settings')
//       console.log('3. Linked Devices')
//       console.log('4. Link a Device')
//       console.log('5. Scan QR')

//       console.log('\n==========================================\n')
//     } catch (err) {
//       console.error('❌ QR generation error:', err)
//     }
//   })

//   // =========================
//   // AUTHENTICATED
//   // =========================
//   client.on('authenticated', () => {
//     console.log('\n🔐 WhatsApp authenticated successfully!\n')
//   })

//   // =========================
//   // AUTH FAILURE
//   // =========================
//   client.on('auth_failure', (msg) => {
//     console.log('\n❌ AUTH FAILURE\n')
//     console.log(msg)
//   })

//   // =========================
//   // READY
//   // =========================
//   client.on('ready', async () => {
//     console.log('\n✅ WhatsApp client ready!\n')

//     global.whatsappReady = true

//     try {
//       const info = client.info

//       console.log('📱 Account Info:')
//       console.log('👤 Push Name:', info.pushname)
//       console.log('📞 Number:', info.wid.user)
//       console.log('🆔 Wid:', info.wid._serialized)
//       console.log('📡 Platform:', info.platform)

//       console.log('\n🎉 WhatsApp fully connected and ready!\n')
//     } catch (err) {
//       console.error('❌ Error getting account info:', err)
//     }
//   })

//   // =========================
//   // LOADING SCREEN
//   // =========================
//   client.on('loading_screen', (percent, message) => {
//     console.log(`⏳ Loading Screen: ${percent}% - ${message}`)
//   })

//   // =========================
//   // STATE CHANGE
//   // =========================
//   client.on('change_state', (state) => {
//     console.log('🔄 State changed:', state)
//   })

//   // =========================
//   // DISCONNECTED
//   // =========================
//   client.on('disconnected', (reason) => {
//     console.log('\n❌ WhatsApp disconnected\n')
//     console.log('Reason:', reason)

//     global.whatsappReady = false
//   })

//   // =========================
//   // MESSAGE RECEIVED
//   // =========================
//   client.on('message', async (message) => {
//     console.log('\n📩 New Message Received')
//     console.log('From:', message.from)
//     console.log('Body:', message.body)
//   })

//   // =========================
//   // MESSAGE SENT
//   // =========================
//   client.on('message_create', async (message) => {
//     if (message.fromMe) {
//       console.log('\n📤 Message Sent')
//       console.log('To:', message.to)
//       console.log('Body:', message.body)
//     }
//   })

//   // =========================
//   // INITIALIZE
//   // =========================
//   try {
//     console.log('\n🚀 Starting WhatsApp initialization...\n')

//     await client.initialize()

//     console.log('✅ client.initialize() completed')

//     global.whatsappClient = client
//   } catch (err) {
//     console.error('\n❌ WhatsApp initialization error:\n')
//     console.error(err)
//   }
// }

async function initializeWhatsApp() {
  if (global.whatsappClient || isInitializing) return

  isInitializing = true

  console.log('🚀 Initializing WhatsApp client...')

  const client = await createClient()

  console.log('✅ Client object created')

  client.on('qr', async (qr) => {
    console.log('\n================ QR EVENT ================\n')

    console.log('📱 QR received from WhatsApp')

    qrcode.generate(qr, { small: true })

    try {
      await QRCode.toFile('./qr.png', qr)

      console.log('✅ QR image saved')
      console.log(
        '🌐 Open: https://whatsapp-roal-maharaj-mango-1-3bo2.onrender.com/qr'
      )
    } catch (err) {
      console.log('❌ QR save failed:', err)
    }

    console.log('\n=========================================\n')
  })

  client.on('authenticated', () => {
    console.log('\n🔐 AUTHENTICATED EVENT FIRED\n')
  })

  client.on('ready', async () => {
    console.log('\n✅ READY EVENT FIRED\n')

    global.whatsappReady = true

    try {
      const info = client.info

      console.log('📱 WhatsApp Number:', info.wid.user)
      console.log('📱 Push Name:', info.pushname)
      console.log('📱 Platform:', info.platform)
    } catch (err) {
      console.log('❌ Error reading client info:', err)
    }
  })

  client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Loading: ${percent}% - ${message}`)
  })

  client.on('change_state', (state) => {
    console.log('🔄 STATE:', state)
  })

  client.on('disconnected', (reason) => {
    console.log('❌ DISCONNECTED:', reason)

    global.whatsappReady = false
  })

  client.on('auth_failure', (msg) => {
    console.log('❌ AUTH FAILURE:', msg)
  })

  process.on('uncaughtException', (err) => {
    console.log('❌ UNCAUGHT EXCEPTION:', err)
  })

  process.on('unhandledRejection', (err) => {
    console.log('❌ UNHANDLED REJECTION:', err)
  })

  setInterval(() => {
    const used = process.memoryUsage()

    console.log('\n========= MEMORY =========')

    console.log(
      `RSS: ${Math.round(used.rss / 1024 / 1024)} MB`
    )

    console.log(
      `Heap Used: ${Math.round(used.heapUsed / 1024 / 1024)} MB`
    )

    console.log('==========================\n')
  }, 15000)

  console.log('🚀 Starting WhatsApp initialization...')

  try {
    await client.initialize()

    console.log('✅ client.initialize() completed')

    global.whatsappClient = client
  } catch (err) {
    console.log('❌ INITIALIZE ERROR:', err)
  }
}

initializeWhatsApp()


const PORT = process.env.PORT || 3000

app.get('/', (_, res) => {
  res.send('WhatsApp server running')
})

app.get('/qr', (_, res) => {
  res.sendFile(process.cwd() + '/qr.png')
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})