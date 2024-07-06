export type EachPostType = { _id: string; title: string; section: string; content: string; createdAt: number; modifiedAt?: number; likes: number }

export type EachPostPreviewType = { title: string; section: string; content: string; createdAt: number; modifiedAt?: number }

export type EachSectionType = { section: string; posts: { _id: string; title: string }[] }

export type EachContactType = { name: string; email: string; message: string; _id: string }
