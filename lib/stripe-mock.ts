/**
 * Stripe Mock Client Library
 * Substitui a integração real com Stripe para fins de demonstração.
 */

import { prisma } from './db'

// Mock do cliente Stripe
export const stripeMock = {
  customers: {
    create: async (options: any) => {
      console.log(`[MOCK STRIPE] Criando cliente: ${options.email}`)
      return {
        id: `cus_MOCK_${Math.random().toString(36).substring(2, 15)}`,
        email: options.email,
        name: options.name,
      }
    },
  },
  subscriptions: {
    create: async (options: any) => {
      console.log(`[MOCK STRIPE] Criando assinatura para cliente: ${options.customer}`)
      const now = Math.floor(Date.now() / 1000)
      const trialEnd = now + (options.trial_period_days || 14) * 24 * 60 * 60
      return {
        id: `sub_MOCK_${Math.random().toString(36).substring(2, 15)}`,
        customer: options.customer,
        status: 'trialing',
        trial_end: trialEnd,
        current_period_start: now,
        current_period_end: trialEnd,
        items: {
          data: [{ id: `si_MOCK_${Math.random().toString(36).substring(2, 15)}` }],
        },
      }
    },
    retrieve: async (id: string) => {
      console.log(`[MOCK STRIPE] Recuperando assinatura: ${id}`)
      return {
        id: id,
        items: {
          data: [{ id: `si_MOCK_${Math.random().toString(36).substring(2, 15)}` }],
        },
      }
    },
    update: async (id: string, options: any) => {
      console.log(`[MOCK STRIPE] Atualizando assinatura: ${id}`)
      return { id: id }
    },
    cancel: async (id: string) => {
      console.log(`[MOCK STRIPE] Cancelando assinatura: ${id}`)
      return { id: id, status: 'canceled' }
    },
  },
  checkout: {
    sessions: {
      create: async (options: any) => {
        console.log(`[MOCK STRIPE] Criando sessão de checkout para cliente: ${options.customer}`)
        return {
          url: `http://localhost:3000/mock-checkout-success?session_id=cs_MOCK`,
        }
      },
    },
  },
  billingPortal: {
    sessions: {
      create: async (options: any) => {
        console.log(`[MOCK STRIPE] Criando portal de cliente para cliente: ${options.customer}`)
        return {
          url: `http://localhost:3000/mock-portal`,
        }
      },
    },
  },
  invoiceItems: {
    create: async (options: any) => {
      console.log(`[MOCK STRIPE] Criando item de fatura para cliente: ${options.customer}`)
      return { id: `ii_MOCK_${Math.random().toString(36).substring(2, 15)}` }
    },
  },
  invoices: {
    create: async (options: any) => {
      console.log(`[MOCK STRIPE] Criando fatura para cliente: ${options.customer}`)
      return { id: `in_MOCK_${Math.random().toString(36).substring(2, 15)}` }
    },
    pay: async (id: string) => {
      console.log(`[MOCK STRIPE] Pagando fatura: ${id}`)
      return { id: id, status: 'paid' }
    },
  },
}
