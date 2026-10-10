// app/writing/[slug]/page.tsx
import { getPostBySlug, getAllPosts } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Chip } from '@/components/ui/Chip';

// 1. Tambahkan tipe Promise dan 'await params'
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);
  
  return {
    title: `${post.meta.title} | Rudi`,
    description: post.meta.summary,
  };
}

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// 2. Ubah fungsi komponen jadi async dan 'await params'
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  return (
    <article className="max-w-3xl mx-auto pt-10 pb-32">
      <header className="mb-12 text-center space-y-6 pb-8 border-b border-gray-200">
        <h1 className="text-4xl md:text-5xl font-sans font-bold leading-tight tracking-tight text-gray-900">{post.meta.title}</h1>
        <div className="flex justify-center items-center gap-4 font-mono text-sm text-gray-500">
          <span>{post.meta.date}</span>
          <span>•</span>
          <span>{post.meta.readingTime}</span>
        </div>
        <div className="flex justify-center gap-2">
          {post.meta.tags?.map((tag: string) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      </header>

      {/* Class 'prose' otomatis mengatur styling markdown (h1, p, list, bold) */}
      <div className="prose prose-lg prose-indigo mx-auto font-sans text-gray-800">
        <MDXRemote source={post.content} />
      </div>
    </article>
  );
}