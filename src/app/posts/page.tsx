import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Server component with SSR
export default async function PostsPage() {
  // Check if user is logged in
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  let currentUser = null

  if (token) {
    try {
      const decoded = verifyToken(token)
      if (decoded?.userId) {
        currentUser = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, name: true, email: true, role: true },
        })
      }
    } catch (error) {
      console.error('Token verification error:', error)
    }
  }

  const posts = await prisma.post.findMany({
    where: {
      published: true, // Only show published posts
    },
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
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Community Posts</h1>
          <div className="flex gap-3">
            {currentUser ? (
              <>
                <Link
                  href="/posts/create"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-medium"
                >
                  Create Post
                </Link>
                <Link
                  href="/gateway"
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition border border-gray-300"
                >
                  Gateway
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition border border-gray-300"
                >
                  Login to Post
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-medium"
                >
                  Register
                </Link>
              </>
            )}
            <Link
              href="/"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Home
            </Link>
          </div>
        </div>

        {!currentUser && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-8 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Join Our Community!</h2>
            <p className="mb-4 opacity-90">Register to create posts and share your thoughts with the community.</p>
            <Link
              href="/auth/register"
              className="inline-block px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-medium"
            >
              Create Account
            </Link>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg mb-4">No posts yet</p>
            {currentUser && (
              <Link
                href="/posts/create"
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition font-medium"
              >
                Be the first to post!
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{post.title}</h2>
                  <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Published
                  </span>
                </div>
                
                {post.content && (
                  <p className="text-gray-700 mb-6 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {(post.author.name || post.author.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{post.author.name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-500">{post.author.email}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
