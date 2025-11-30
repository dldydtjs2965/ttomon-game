'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// 윈도우 포커스 시 자동 재요청 비활성화 (필요에 따라 조정)
						refetchOnWindowFocus: false,
						// 에러 발생 시 재시도 횟수
						retry: 1,
					},
				},
			})
	)

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}
