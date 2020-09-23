export default `
  type Document {
    _id: String
    isPublic: Boolean
    title: String
    createdAt: String
    updatedAt: String
    listBodies: [String]
    body: String
    resizedBase64: String
    owner: String
    comments(sortBy: String): [Comment]
  }
`;
