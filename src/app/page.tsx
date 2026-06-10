import { getServerSession } from 'next-auth'
import { ChatInterface } from './chat-interface'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return <ChatInterface username={session?.user?.name ?? 'Moi'} />
}
