import sanitizeHtml from 'sanitize-html';
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
  resizeDocument: (root, args, context) => {
    /*
    const startPath = __dirname;
    const images64 = [];
    let image;

    function base64Encode(file) {
      const bitmap = fs.readFileSync(file);
      return Buffer.from(bitmap).toString('base64');
    }

    const doc = [];
    const filter = ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.svg'];
    const files = fs.readdirSync(startPath);
    for (let i = 0, filesLength = files.length; i < filesLength; i += 1) {
      const filename = path.join(startPath, files[i]);
      // checks if the current file has the extension type of an image
      if (filter.some((extension) => path.extname(filename.toLowerCase()) === extension)) {
        image = base64Encode(files[i]);
        images64.push(image);
        if (!context.user) throw new Error('Sorry, you must be logged in to add a new document.');
        const date = new Date().toISOString();
        const documentId = Documents.insert({
          isPublic: true,
          title: `Resized Image #${Documents.find({ owner: context.user._id }).count() + 1}`,
          body: image,
          owner: context.user._id,
          createdAt: date,
          updatedAt: date,
        });
        doc.push(Documents.findOne(documentId));
      }
    }
    return doc;
    */
    if (!context.user) throw new Error('Sorry, you must be logged in to add a new document.');
    const date = new Date().toISOString();
    const documentId = Documents.insert({
      isPublic: false,
      title: 
        'Batch',
      body: 'This is my document. There are many like it, but this one is mine.',
      resizedBase64: args.listBodies[0],
      owner: context.user._id,
      createdAt: date,
      updatedAt: date,
    });
    const doc = Documents.findOne(documentId);
    return doc;
  },
  removeDocument: (root, args, context) => {
    if (!context.user) throw new Error('Sorry, you must be logged in to remove a document.');
    if (!Documents.findOne({ _id: args._id, owner: context.user._id }))
      throw new Error('Sorry, you need to be the owner of this document to remove it.');
    Documents.remove(args);
    return args;
  },
};
