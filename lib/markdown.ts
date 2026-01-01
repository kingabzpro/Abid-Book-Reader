import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeSanitize from "rehype-sanitize";

export async function markdownToHtml(markdown: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize)
    .use(rehypeStringify);

  const result = await processor.process(markdown);
  return result.toString();
}

export interface Chapter {
  slug: string;
  title: string;
  isPublic: boolean;
  content: string;
}

export interface BookMeta {
  title: string;
  description: string;
  author: string;
  coverImage?: string;
  publicChapterCount: number;
}

export interface Book {
  id: string;
  meta: BookMeta;
  chapters: Chapter[];
}
