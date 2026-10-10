// app/writing/page.tsx
import Link from 'next/link';
import { getAllPosts } from '@/lib/mdx';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';

export default function WritingPage() {
  const posts = getAllPosts();

  return (
    <div className="space-y-12 pb-20 pt-10 max-w-4xl mx-auto">
      <header className="space-y-4">
        <h1 className="text-5xl font-sans font-bold">Writing</h1>
        <p className="font-mono text-gray-500">Thoughts on business analysis, tech projects, and my learning journey.</p>
      </header>
      
      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="font-mono text-gray-400 border border-dashed border-gray-300 p-8 text-center rounded-lg">No articles yet. Start writing in content/articles!</p>
        ) : (
          posts.map((post) => (
            <Link key={post.slug} href={`/writing/${post.slug}`}>
              <Card className="hover:border-indigo-300 transition-colors cursor-pointer group">
                <div className="flex flex-col gap-3">
                  <h2 className="text-2xl font-sans font-bold group-hover:text-indigo-600 transition-colors">{post.meta.title}</h2>
                  <p className="font-mono text-gray-600 text-sm leading-relaxed">{post.meta.summary}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="font-mono text-xs text-gray-400">{post.meta.date}</span>
                    <span className="font-mono text-xs text-gray-300">•</span>
                    <span className="font-mono text-xs text-gray-400">{post.meta.readingTime}</span>
                    <div className="flex gap-2 ml-auto">
                      {post.meta.tags?.map((tag: string) => (
                        <Chip key={tag}>{tag}</Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}