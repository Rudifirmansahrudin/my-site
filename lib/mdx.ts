// lib/mdx.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

export interface PostMeta {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  readingTime: string;
}

const postsDirectory = path.join(process.cwd(), 'content/articles');

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.mdx'));
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  const { data, content } = matter(fileContents);
  
  const meta: PostMeta = {
    title: data.title || 'Untitled',
    date: data.date || 'No Date',
    summary: data.summary || '',
    tags: data.tags || [],
    readingTime: readingTime(content).text,
  };

  return {
    slug: realSlug,
    meta,
    content,
  };
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .sort((a, b) => (new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()));
  return posts;
}