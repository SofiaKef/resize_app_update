export default `
  type Document {
    _id: String
    isPublic: Boolean
    title: String
    createdAt: String
    updatedAt: String
    body: String
    originalDataUrl: String
    resizedDataUrl: String
    listImages: [String]
    owner: String
    comments(sortBy: String): [Comment]
  }
`;
