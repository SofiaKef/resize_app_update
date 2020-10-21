import React, { useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { useMutation, useQuery, NetworkStatus } from '@apollo/client';
import { documents as documentsQuery } from '../../queries/Documents.gql';
import { addDocument, addImages, resizeImage } from '../../mutations/Documents.gql';
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
  const [uploadImages, setUploadImages] = useState(() => {});
  const [imagesLength, setImagesLength] = useState(0);
  const [imageState, setImageState] = useState('No images');
  const { loading, data, error, refetch, networkStatus } = useQuery(documentsQuery, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
  });
  const [addDocumentMutation] = useMutation(addDocument, {
    refetchQueries: [{ query: documentsQuery }],
    onCompleted: (mutation) => {
      history.push(`/documents/${mutation.addDocument._id}/edit`);
    },
  });
  const [addImagesMutation] = useMutation(addImages, {});
  const [resizeImageMutation] = useMutation(resizeImage, {});

  if (networkStatus === NetworkStatus.refetch) return 'Refetching!';

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <pre>{error}</pre>;
  }

  const { documents } = data;

  // when user submits images to be uploaded
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('1st time?');
    for (let i = 0; i < inputRef.current.files.length; i += 1) {
      const reader = new FileReader();
      reader.onloadend = (readerEvent) => {
        setImages((imagesLocal) => {
          // if all images are done loading
          setImagesLength(imagesLocal.length + 1);
          if (imagesLocal.length + 1 === inputRef.current.files.length) {
            setImageState('Images Processed');
          }
          return [...imagesLocal, readerEvent.target.result];
        });
      };
      reader.readAsDataURL(inputRef.current.files[i]);
    }
  };

  if (imageState === 'Images Processed') {
    setUploadImages(() => {
      for (let i = 0; i < imagesLength; i += 1) {
        // mutation runs automatically without being tied to a click event of a button
        addImagesMutation({
          variables: { originalDataUrl: images[i] },
          refetchQueries: [{ query: documentsQuery }],
        }).then(
          (mutation) => {
            console.log('ok', JSON.stringify({ mutation }, null, 2));
          },
          (err) => {
            console.log('error', JSON.stringify({ err }, null, 2));
          },
        );
      }
    });
    // ressetting anything related to the form
    setImageState('Images Uploaded');
    setImagesLength(0);
    setUploadImages(() => {});
    setImages([]);
    inputRef.current.value = '';
  }

  const resizeImages = () => {
    documents.forEach(({ _id, originalDataUrl, resizedDataUrl }) => {
      if (originalDataUrl != null && resizedDataUrl == null) {
        resizeImageMutation({
          variables: { _id: _id, originalDataUrl: originalDataUrl },
          refetchQueries: [{ query: documentsQuery }],
          awaitRefetchQueries: true,
        }).then(
          (mutation) => {
            /*  manually call refetch because both then and onComplete
        would return resizeImage and resizedDataUrl as null */
            refetch();
            console.log('ok', JSON.stringify({ mutation }, null, 2));
          },
          (err) => {
            console.log('error', JSON.stringify({ err }, null, 2));
          },
        );
      }
    });
  };

  return (
    <StyledDocuments>
      {documents && documents.length ? (
        <div>
          <Button onClick={resizeImages}>Resize all images</Button>
          <DocumentsList>
            {documents.map(
              ({
                _id,
                isPublic,
                title,
                originalDataUrl,
                resizedDataUrl,
                updatedAt,
                resizeProcessTime,
              }) => (
                <Document key={_id}>
                  <Link to={`/documents/${_id}/edit`} />
                  <header>
                    {isPublic ? (
                      <span className="label label-success">Public</span>
                    ) : (
                      <span className="label label-default">Private</span>
                    )}
                    <h2>{title}</h2>
                    <p>
                      {timeago(updatedAt)}, {`${resizeProcessTime}s`}
                    </p>
                    {originalDataUrl && (
                      <img
                        alt={title}
                        src={resizedDataUrl ? resizedDataUrl : originalDataUrl}
                        style={{ width: '100%' }}
                      />
                    )}
                  </header>
                </Document>
              ),
            )}
          </DocumentsList>
          <form onSubmit={handleSubmit}>
            <label>
              Add images:
              <input type="file" ref={inputRef} multiple />
            </label>
            <br />
            <button type="submit">Upload</button>
          </form>
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
