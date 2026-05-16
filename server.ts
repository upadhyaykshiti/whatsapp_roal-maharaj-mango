import express from 'express'
import cors from 'cors'
import { Client, LocalAuth } from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import puppeteer from 'puppeteer'

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
      headless: true,    
      executablePath: puppeteer.executablePath(),
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
