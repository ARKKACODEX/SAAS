/**
 * Twilio Mock Client Library
 * Substitui a integração real com Twilio para fins de demonstração.
 */

import { prisma } from './db'

// Mock do cliente Twilio
export const twilioClientMock = {
  availablePhoneNumbers: (country: string) => ({
    local: {
      list: async (options: { areaCode: string; limit: number }) => {
        // Retorna um número mock
        return [
          {
            phoneNumber: `+1${options.areaCode}5551234`,
          },
        ]
      },
    },
  }),
  incomingPhoneNumbers: {
    create: async (options: any) => {
      // Simula a criação de um número
      return {
        phoneNumber: options.phoneNumber,
        sid: `PN_MOCK_${Math.random().toString(36).substring(2, 15)}`,
      }
    },
  },
  messages: {
    create: async (options: any) => {
      // Simula o envio de SMS
      console.log(`[MOCK SMS] Enviando SMS para ${options.to}: ${options.body}`)
      return {
        sid: `SM_MOCK_${Math.random().toString(36).substring(2, 15)}`,
        price: '0.0075',
      }
    },
  },
  calls: {
    create: async (options: any) => {
      // Simula a criação de chamada
      console.log(`[MOCK CALL] Iniciando chamada para ${options.to}`)
      return {
        sid: `CA_MOCK_${Math.random().toString(36).substring(2, 15)}`,
      }
    },
  },
  recordings: (sid: string) => ({
    fetch: async () => {
      // Simula a busca de gravação
      return {
        uri: `/2010-04-01/Accounts/AC_MOCK/Recordings/${sid}.json`,
        duration: '60',
      }
    },
  }),
}

/**
 * Provisiona um número de telefone mock para demonstração
 */
export async function provisionPhoneNumberMock(params: {
  accountId: string
  areaCode?: string
  country?: string
}) {
  const { accountId, areaCode = '415' } = params

  // Simula a busca e compra de um número
  const numbers = await twilioClientMock.availablePhoneNumbers('US').local.list({
    areaCode,
    limit: 1,
  })

  const phoneNumber = await twilioClientMock.incomingPhoneNumbers.create({
    phoneNumber: numbers[0].phoneNumber,
    voiceUrl: `http://localhost:3000/api/twilio/voice`,
    smsUrl: `http://localhost:3000/api/twilio/sms`,
    statusCallback: `http://localhost:3000/api/twilio/status`,
    friendlyName: `ReplyHub - ${accountId}`,
  })

  // Atualiza a conta com o número mock
  await prisma.account.update({
    where: { id: accountId },
    data: {
      twilioPhoneNumber: phoneNumber.phoneNumber,
      twilioPhoneSid: phoneNumber.sid,
    },
  })

  return {
    phoneNumber: phoneNumber.phoneNumber,
    sid: phoneNumber.sid,
  }
}

/**
 * Envia SMS mock
 */
export async function sendSMSMock(params: {
  to: string
  from: string
  body: string
  accountId: string
  contactId?: string
}) {
  // Simula o envio de SMS
  const message = await twilioClientMock.messages.create({
    to: params.to,
    from: params.from,
    body: params.body,
  })

  // Salva no banco de dados (sem custo real)
  if (params.contactId) {
    await prisma.message.create({
      data: {
        accountId: params.accountId,
        contactId: params.contactId,
        type: 'SMS',
        direction: 'OUTBOUND',
        from: params.from,
        to: params.to,
        body: params.body,
        status: 'SENT',
        twilioSid: message.sid,
        cost: 0, // Custo zero para demonstração
      },
    })

    // Track usage
    await prisma.account.update({
      where: { id: params.accountId },
      data: {
        smsUsed: { increment: 1 },
      },
    })
  }

  return message
}

/**
 * Faz chamada mock
 */
export async function makeCallMock(params: {
  to: string
  from: string
  twiml: string
  accountId: string
  contactId?: string
}) {
  // Simula a criação de chamada
  const call = await twilioClientMock.calls.create({
    to: params.to,
    from: params.from,
    twiml: params.twiml,
    statusCallback: `http://localhost:3000/api/twilio/status`,
    record: true,
  })

  // Salva no banco de dados
  if (params.contactId) {
    await prisma.call.create({
      data: {
        accountId: params.accountId,
        contactId: params.contactId,
        from: params.from,
        to: params.to,
        direction: 'OUTBOUND',
        status: 'INITIATED',
        callSid: call.sid,
      },
    })
  }

  return call
}

/**
 * Busca gravação mock
 */
export async function getRecordingMock(recordingSid: string) {
  const recording = await twilioClientMock.recordings(recordingSid).fetch()
  return {
    url: `http://localhost:3000/mock-recording.mp3`, // URL mock
    duration: parseInt(recording.duration),
  }
}
