export interface Post {
  id: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    name: string;
    email: string;
  };
}
