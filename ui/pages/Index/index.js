import React, { useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { documents as documentsQuery } from '../../queries/Documents.gql';
import { addDocument, addImages } from '../../mutations/Documents.gql';
import { timeago } from '../../../modules/dates';
import BlankState from '../../components/BlankState';
import Loading from '../../components/Loading';
import { Document, DocumentsList, StyledDocuments } from '../DocumentsUseQueryUseMutation/styles';

const DocumentsUseQueryUseMutation = () => {
  const history = useHistory();
  const inputRef = useRef();
  /* used state to store images because pushing then from inside function into
  an array that was defined outside, didn't make any changes */
  const [images, setImages] = useState([]);
  const [imageState, setImageState] = useState('No images');
  const { loading, data, error } = useQuery(documentsQuery);
  const [addDocumentMutation] = useMutation(addDocument, {
    refetchQueries: [{ query: documentsQuery }],
    onCompleted: (mutation) => {
      history.push(`/documents/${mutation.addDocument._id}/edit`);
    },
  });
  const [addImagesMutation] = useMutation(addImages, {
    refetchQueries: [{ query: documentsQuery }],
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <pre>{error}</pre>;
  }

  const { documents } = data;

  const handleSubmit = (event) => {
    event.preventDefault();
    for (let i = 0; i < inputRef.current.files.length; i += 1) {
      const reader = new FileReader();
      reader.onloadend = (readerEvent) => {
        setImages((imagesLocal) => {
          // if all images are done loading
          if (imagesLocal.length + 1 === inputRef.current.files.length) {
            setImageState('Images Uploaded');
          }
          return [...imagesLocal, readerEvent.target.result];
        });
      };
      reader.readAsDataURL(inputRef.current.files[i]);
    }
  };

  if (imageState === 'Images Uploaded') {
    // showcase that images is an array of strings ([String])
    console.log(`isArray images: ${Array.isArray(images)}`);
    console.log(`typeof image[0]: ${typeof images[0]}`);
    console.log(`images: ${images}`);
  }

  return (
    <StyledDocuments>
      {documents && documents.length ? (
        <div>
          <DocumentsList>
            {documents.map(({ _id, isPublic, title, updatedAt }) => (
              <div key={_id}>
                <Document key={_id}>
                  <Link to={`/documents/${_id}/edit`} />
                  <header>
                    {isPublic ? (
                      <span className="label label-success">Public</span>
                    ) : (
                      <span className="label label-default">Private</span>
                    )}
                    <h2>{title}</h2>
                    <p>{timeago(updatedAt)}</p>
                  </header>
                </Document>
              </div>
            ))}
          </DocumentsList>
          {imageState === 'Images Uploaded' ? (
            <div>
              <Button onClick={() => addImagesMutation({ variables: { listImages: images } })}>
                Add Images To Collection
              </Button>
              {images.map((currImage, currIndex) => (
                <div key={currIndex}>
                  <img alt="" src={currImage} />
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>
                Add images:
                <input type="file" ref={inputRef} multiple />
              </label>
              <br />
              <button type="submit">Upload</button>
            </form>
          )}
        </div>
      ) : (
        <BlankState
          icon={{ style: 'solid', symbol: 'file-alt' }}
          title="You're plum out of documents, friend!"
          subtitle="Add your first document by clicking the button below."
          action={{
            style: 'success',
            onClick: addDocumentMutation,
            label: 'Create Your First Document',
          }}
        />
      )}
    </StyledDocuments>
  );
};

DocumentsUseQueryUseMutation.propTypes = {};

export default DocumentsUseQueryUseMutation;
