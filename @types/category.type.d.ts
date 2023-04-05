interface Category {
  name: string,
  description: string,
  image: string,
  parent: string,
  order: number,
  translations: {
    vi: {
      name: string,
      description: string
    }
  }
}