import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Server component with SSR
export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Posts</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Home
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No posts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-2xl font-semibold">{post.title}</h2>
                  {post.published ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Published
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Draft
                    </span>
                  )}
                </div>
                
                {post.content && (
                  <p className="text-gray-700 mb-4">{post.content}</p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    By: <span className="font-medium">{post.author.name || post.author.email}</span>
                  </span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
