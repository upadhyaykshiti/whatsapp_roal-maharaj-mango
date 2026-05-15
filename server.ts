import express from 'express'
import cors from 'cors'
import { Client, LocalAuth } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'

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

const client =
  global.whatsappClient ||
  new Client({
    authStrategy: new LocalAuth({
      clientId: 'royal-maharaja-mango',
    }),
    puppeteer: {
      headless: false,
      executablePath:
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    },
  })

if (!global.whatsappClient && !isInitializing) {
  isInitializing = true

  console.log('🚀 Initializing WhatsApp client...')

  client.on('qr', (qr) => {
    console.log('\n📱 Scan this QR with WhatsApp:\n')
    qrcode.generate(qr, { small: true })
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

  client.initialize()

  global.whatsappClient = client
}

// export async function sendWhatsApp(message: string) {
//   try {
//     if (!global.whatsappReady) {
//       console.warn('⚠️ WhatsApp not ready yet')
//       return
//     }

//     const phone = process.env.WHATSAPP_PHONE

//     if (!phone) {
//       console.warn('⚠️ WHATSAPP_PHONE missing')
//       return
//     }

//     const chatId = `${phone}@c.us`

//     await client.sendMessage(chatId, message)

//     console.log('✅ WhatsApp message sent')
//   } catch (err) {
//     console.error('❌ WhatsApp send error:', err)
//   }
// }



// const client = new Client({
//   authStrategy: new LocalAuth({
//     clientId: 'royal-maharaja-mango',
//   }),
//   puppeteer: {
//     headless: true,
//     executablePath:
//     'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
//     args: [
//       '--no-sandbox',
//       '--disable-setuid-sandbox',
//       '--disable-dev-shm-usage',
//     ],
//   },
// })

// client.on('qr', (qr: string) => {
//   console.log('\n📱 Scan this QR with WhatsApp:\n')
//   qrcode.generate(qr, { small: true })
// })

// client.on('authenticated', () => {
//   console.log('🔐 WhatsApp authenticated')
// })

// client.on('ready', () => {
//   console.log('✅ WhatsApp ready!')
// })

// client.on('disconnected', (reason) => {
//   console.log('❌ WhatsApp disconnected:', reason)
// })

// client.initialize()

// app.post('/send', async (req, res) => {
//   try {
//     const { message } = req.body

//     const phone = process.env.WHATSAPP_PHONE

//     if (!phone) {
//       return res.status(500).json({
//         error: 'WHATSAPP_PHONE missing',
//       })
//     }

//     await client.sendMessage(`${phone}@c.us`, message)

//     console.log('✅ WhatsApp message sent')

//     return res.json({
//       success: true,
//     })
//   } catch (err) {
//     console.error('❌ WhatsApp send error:', err)

//     return res.status(500).json({
//       error: 'Failed to send message',
//     })
//   }
// })

// const PORT = process.env.PORT || 3001

// app.listen(PORT, () => {
//   console.log(`🚀 WhatsApp service running on port ${PORT}`)
// })