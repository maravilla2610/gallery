'use server'

import prisma from '@/prisma/client'
import { transactions } from '@prisma/client'



export async function getTransactions(): Promise<transactions[]> {
    try {
        const transactions = await prisma.transactions.findMany()
        return transactions
    } catch (error) {
        console.error('Error fetching transactions:', error)
        throw new Error('Failed to fetch transactions')
    }
}