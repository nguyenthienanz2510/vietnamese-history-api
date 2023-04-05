interface Post {
  title: string,
  description: string,
  content: string,
  thumb: string,
  categories: string[],
  author: string,
  likes: number,
  order: number,
  comments: string[],
  translations: {
    vi: {
      title: string,
      description: string,
      content: string,
    }
  }
}