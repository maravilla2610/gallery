import { getTransactions } from '@/app/actions/transactions'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'


export function useTransactions() {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: getTransactions,
    })
}