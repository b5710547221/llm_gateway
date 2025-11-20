import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Post {
  id: string
  title: string
  content: string | null
  published: boolean
  authorId: string
  createdAt: Date
  updatedAt: Date
}

interface PostsState {
  posts: Post[]
  isLoading: boolean
  error: string | null
  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  updatePost: (id: string, post: Partial<Post>) => void
  deletePost: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const usePostsStore = create<PostsState>()(
  devtools((set) => ({
    posts: [],
    isLoading: false,
    error: null,
    setPosts: (posts) => set({ posts }),
    addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
    updatePost: (id, updatedPost) =>
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === id ? { ...post, ...updatedPost } : post
        ),
      })),
    deletePost: (id) =>
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
      })),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
  }))
)
