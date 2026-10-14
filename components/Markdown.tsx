// components/Markdown.tsx  (butuh: npm i react-markdown)
import ReactMarkdown, { type Components } from "react-markdown";

const md: Components = {
  h2: ({ children }) => <h2 className="mt-12 mb-3 text-2xl font-bold leading-snug text-gray-900">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 mb-2 text-xl font-bold leading-snug text-gray-900">{children}</h3>,
  p: ({ children }) => <p className="my-5">{children}</p>,
  ul: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-5 list-decimal space-y-2 pl-6">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  hr: () => <hr className="my-10 border-gray-200" />,
  blockquote: ({ children }) => (
    <blockquote className="my-6 rounded-r-lg border-l-4 border-[#B9A5F0] bg-[#F7F3FF] py-1 pr-4 pl-5 text-gray-800">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="font-medium text-gray-900 underline decoration-[#B9A5F0] decoration-2 underline-offset-4 hover:decoration-gray-900"
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" className="my-6 w-full rounded-lg border border-gray-200" />;
  },
};

export default function Markdown({ children }: { children: string }) {
  return <ReactMarkdown components={md}>{children}</ReactMarkdown>;
}
