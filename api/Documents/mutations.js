import sanitizeHtml from 'sanitize-html';
import sharp from 'sharp';
import Documents from './Documents';

export default {
  addDocument: (root, args, context) => {
    if (!context.user) throw new Error('Sorry, you must be logged in to add a new document.');
    const date = new Date().toISOString();
    const documentId = Documents.insert({
      isPublic: args.isPublic || false,
      title:
        args.title ||
        `Untitled Document #${Documents.find({ owner: context.user._id }).count() + 1}`,
      body: args.body
        ? sanitizeHtml(args.body)
        : 'This is my document. There are many like it, but this one is mine.',
      owner: context.user._id,
      createdAt: date,
      updatedAt: date,
    });
    const doc = Documents.findOne(documentId);
    return doc;
  },
  updateDocument: (root, args, context) => {
    if (!context.user) throw new Error('Sorry, you must be logged in to update a document.');
    if (!Documents.findOne({ _id: args._id, owner: context.user._id }))
      throw new Error('Sorry, you need to be the owner of this document to update it.');
    Documents.update(
      { _id: args._id },
      {
        $set: {
          ...args,
          body: sanitizeHtml(args.body),
          updatedAt: new Date().toISOString(),
        },
      },
    );
    const doc = Documents.findOne(args._id);
    return doc;
  },
  addImages: (root, args, context) => {
    console.log('addImages', JSON.stringify({ args }, null, 2));
    if (!context.user) throw new Error('Sorry, you must be logged in to add a new document.');
    const date = new Date().toISOString();
    const documentId = Documents.insert({
      isPublic: false,
      title: `Untitled Image #${Documents.find({ owner: context.user._id }).count() + 1}`,
      body: 'This is my image. There are many like it, but this one is mine.',
      owner: context.user._id,
      createdAt: date,
      updatedAt: date,
      originalDataUrl: args.originalDataUrl,
    });
    const doc = Documents.findOne(documentId);
    return doc;
  },
  resizeImage: (root, args, context) => {
    if (!context.user) throw new Error('Sorry, you must be logged in to update a document.');
    if (!Documents.findOne({ _id: args._id, owner: context.user._id }))
      throw new Error('Sorry, you need to be the owner of this document to update it.');
    const parts = args.originalDataUrl.split(';');
    const mimType = parts[0].split(':')[1];
    const imageData = parts[1].split(',')[1];
    const img = Buffer.from(imageData, 'base64');
    sharp(img)
      .resize({ width: 25 })
      .toBuffer()
      .then((resizedImageBuffer) => {
        const resizedImageData = resizedImageBuffer.toString('base64');
        const resizedBase64 = `data:${mimType};base64,${resizedImageData}`;
        Documents.update(
          { _id: args._id },
          {
            $set: {
              ...args,
              resizedDataUrl: resizedBase64,
              updatedAt: new Date().toISOString(),
            },
          },
        );
        const doc = Documents.findOne(args._id);
        return doc;
      })
      .catch((error) => {
        return error;
      });
  },
  removeDocument: (root, args, context) => {
    if (!context.user) throw new Error('Sorry, you must be logged in to remove a document.');
    if (!Documents.findOne({ _id: args._id, owner: context.user._id }))
      throw new Error('Sorry, you need to be the owner of this document to remove it.');
    Documents.remove(args);
    return args;
  },
};
