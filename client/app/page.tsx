'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'

type Comment = {
  user: string
  text: string
}

type Post = {
  id: number
  user: string
  movie: string
  image: string
  description: string
  likes: number
  comments: Comment[]
}

const initialPosts: Post[] = [
  {
    id: 1,
    user: 'CineLover22',
    movie: 'Dune: Part Two',
    image: '/images/dune2.jpg',
    description: 'Just watched it again — pure cinematic masterpiece. 🔥',
    likes: 124,
    comments: [
      { user: 'FilmCritic', text: 'Totally agree! The visuals are insane.' },
      { user: 'MovieBuff', text: 'Best sci-fi of the decade.' },
    ],
  },
  {
    id: 2,
    user: 'MovieFanatic',
    movie: 'Oppenheimer',
    image: '/images/oppenheimer.jpg',
    description: 'That soundtrack still gives me chills. 🧨',
    likes: 98,
    comments: [{ user: 'CineAddict', text: 'Nolan never misses!' }],
  },
  {
    id: 3,
    user: 'PopcornAddict',
    movie: 'Barbie',
    image: '/images/barbie.jpg',
    description: 'Color, music, humor — Greta Gerwig nailed it 💖',
    likes: 210,
    comments: [
      { user: 'CineGirl', text: 'One of the funniest films this year!' },
    ],
  },
]

export default function HomePage() {
  const [posts, setPosts] = useState(initialPosts)

  const handleLike = (id: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center">
      {/* Large scroll area */}
      <div className="w-full max-w-5xl py-10 space-y-16 px-6 md:px-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          🎥 Movie Feed
        </h1>

        {posts.map((post) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-gray-200 rounded-full" />
                <div>
                  <p className="font-semibold text-sm">{post.user}</p>
                  <p className="text-xs text-gray-500">{post.movie}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">•••</button>
            </div>

            {/* Image */}
            <div className="relative w-full h-[600px] md:h-[700px]">
              <Image
                src={post.image}
                alt={post.movie}
                fill
                className="object-cover"
              />
            </div>

            {/* Actions + Content */}
            <div className="px-6 py-4">
              {/* Buttons */}
              <div className="flex items-center space-x-5 text-2xl">
                <button
                  onClick={() => handleLike(post.id)}
                  className="hover:scale-110 transition"
                >
                  ❤️
                </button>
                <button className="hover:scale-110 transition">💬</button>
                <button className="hover:scale-110 transition">🔁</button>
              </div>

              {/* Likes */}
              <p className="text-sm mt-2 font-semibold">{post.likes} likes</p>

              {/* Description */}
              <p className="mt-2 text-gray-800 text-sm leading-relaxed">
                <span className="font-semibold">{post.user}</span>{' '}
                {post.description}
              </p>

              {/* Comments */}
              <div className="mt-3 space-y-1">
                {post.comments.map((c, i) => (
                  <p key={i} className="text-sm">
                    <span className="font-semibold">{c.user}</span> {c.text}
                  </p>
                ))}
              </div>

              {/* Add comment */}
              <div className="mt-4 border-t pt-3">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full text-sm text-gray-600 outline-none focus:text-gray-900"
                />
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </main>
  )
}
