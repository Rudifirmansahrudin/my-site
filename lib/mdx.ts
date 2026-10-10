// lib/mdx.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const postsDirectory = path.join(process.cwd(), 'content/articles');

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.mdx'));
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  // Parse frontmatter pakai gray-matter
  const { data, content } = matter(fileContents);
  
  return {
    slug: realSlug,
    meta: {
      ...data,
      readingTime: readingTime(content).text,
    },
    content,
  };
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // Urutkan dari yang paling baru
    .sort((a, b) => (new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()));
  return posts;
}