export type EachPostType = { _id: string; title: string; section: string; content: string; createdAt: number; modifiedAt?: number; likes: number; private: boolean; pinned: boolean }

export type EachPostPreviewType = { title: string; section: string; content: string; createdAt: number; modifiedAt?: number; private: boolean; pinned: boolean }

export type EachSectionType = { section: string; posts: { _id: string; title: string }[] }

export type EachContactType = { name: string; email: string; message: string; _id: string }
