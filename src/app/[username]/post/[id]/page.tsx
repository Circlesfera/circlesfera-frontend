import { getPostById } from '@/services/postService'
import PostCard from '@/components/PostCard'
import ProtectedRoute from '@/components/ProtectedRoute'
import { notFound } from 'next/navigation'

interface Props {
  params: { username: string; id: string }
}

export default async function UserPostDetailPage({ params }: Props) {
  const { id } = params
  let post = null
  try {
    const response = await getPostById(id)
    post = response.post
  } catch {
    return notFound()
  }

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto mt-8">
        <PostCard post={post} />
      </div>
    </ProtectedRoute>
  )
}
