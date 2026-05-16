// import express from 'express'
// import cors from 'cors'
// import { Client, LocalAuth } from 'whatsapp-web.js'
// import qrcode from 'qrcode-terminal'
// import chromium from '@sparticuz/chromium'

// const app = express()

// app.use(cors())
// app.use(express.json())


// declare global {
//   // eslint-disable-next-line no-var
//   var whatsappClient: Client | undefined
//   // eslint-disable-next-line no-var
//   var whatsappReady: boolean | undefined
// }

// global.whatsappReady = global.whatsappReady || false

// let isInitializing = false

// const client =
//   global.whatsappClient ||
//   new Client({
//     authStrategy: new LocalAuth({
//       clientId: 'royal-maharaja-mango',
//     }),
//     puppeteer: {

//       executablePath: await chromium.executablePath(),


//       headless: true,  
      


//       // args: [
//       //   '--no-sandbox',
//       //   '--disable-setuid-sandbox',
//       //   '--disable-dev-shm-usage',
//       //   '--disable-gpu',
//       //   '--single-process',
//       //   '--no-zygote',

//       // ],
//       args: [
//         ...chromium.args,
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//       ],
//     },
//   })

// if (!global.whatsappClient && !isInitializing) {
//   isInitializing = true

//   console.log('🚀 Initializing WhatsApp client...')

//   client.on('qr', (qr) => {
//     console.log('\n📱 Scan this QR with WhatsApp:\n')
//     qrcode.generate(qr, { small: true })
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

//   client.initialize()

//   global.whatsappClient = client
// }



import express from 'express'
import cors from 'cors'
import { Client, LocalAuth } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import chromium from '@sparticuz/chromium'

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

      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    },
  })
}

async function initializeWhatsApp() {
  if (global.whatsappClient || isInitializing) return

  isInitializing = true

  console.log('🚀 Initializing WhatsApp client...')

  const client = await createClient()

    client.on('qr', (qr) => {
    console.log('\n📱 Scan this QR with WhatsApp:\n')
    // qrcode.generate(qr, { small: true })
    client.on('qr', async () => {
      console.log('📱 Requesting pairing code...')

      const code = await client.requestPairingCode('16478898529')

      console.log('\n🔑 Pairing Code:', code)
    })
  })

  client.on('authenticated', () => {
    console.log('🔐 WhatsApp authenticated')
  })

  client.on('ready', () => {
    console.log('✅ WhatsApp client ready!')
    global.whatsappReady = true
  })

  client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp disconnected:', reason)
    global.whatsappReady = false
  })

  await client.initialize()

  global.whatsappClient = client
}

initializeWhatsApp()


const PORT = process.env.PORT || 3000

app.get('/', (_, res) => {
  res.send('WhatsApp server running')
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})