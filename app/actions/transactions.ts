'use server'

import prisma from '@/prisma/client'
import { Transaction } from '@/lib/schemas/transactions.schema'

export async function getTransactions(): Promise<Transaction[]> {
    try {
        const transactions = await prisma.transactions.findMany()
        // Convert Decimal to number for client-safe transmission
        return transactions.map(t => ({
            id: t.id,
            created_at: t.created_at,
            amount: t.amount ? parseFloat(t.amount.toString()) : null,
            blumon_id: t.blumon_id,
            art_piece_id: t.art_piece_id,
        }))
    } catch (error) {
        console.error('Error fetching transactions:', error)
        throw new Error('Failed to fetch transactions')
    }
}