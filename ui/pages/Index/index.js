import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { documents as documentsQuery } from '../../queries/Documents.gql';
import { addDocument, resizeDocument } from '../../mutations/Documents.gql';
import { timeago } from '../../../modules/dates';
import BlankState from '../../components/BlankState';
import Loading from '../../components/Loading';
import { Document, DocumentsList, StyledDocuments } from '../DocumentsUseQueryUseMutation/styles';

const DocumentsUseQueryUseMutation = () => {
  const [images, setImages] = useState(null);
  const [isLoading, setIsLoading] = useState('No Images');
  const [fetchError, setFetchError] = useState(false);
  const history = useHistory();
  const { loading, data, error } = useQuery(documentsQuery);
  const [addDocumentMutation] = useMutation(addDocument, {
    refetchQueries: [{ query: documentsQuery }],
    onCompleted: (mutation) => {
      history.push(`/documents/${mutation.addDocument._id}/edit`);
    },
  });
  const [resizeDocumentMutation] = useMutation(resizeDocument, {
    refetchQueries: [{ query: documentsQuery }],
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <pre>{error}</pre>;
  }

  useEffect(() => {
    const fetchData = async () => {
      fetch('http://localhost:5010/resize')
        .then((res) => res.json())
        .then((res) => setImages(res))
        .then(() => setIsLoading('Images Loaded'))
        .catch(() => setFetchError(true));
    };
    fetchData();
  }, []);

  if (isLoading === 'Images Loaded') {
    console.log(images);
    //for (let i = 0; i < 4; i += 1) {
    //  buggedArray.push(images[i]);
    //}
    setIsLoading('Images Displayed');
  }

  if (isLoading !== 'Images Displayed') {
    return <Loading />;
  }
  /*
  const listImages = this.images.map((image) => (
    <li key={image.id}>
      {image.id}, {image.content[10]}
      <img alt="" src={`data:image/jpeg;base64,${image.content}`} />
    </li>
  ));
  */

  let buggedArray = [];
  buggedArray[0] = images[0];
  buggedArray[1] = images[1];
  console.log(buggedArray);
  const imageArray = ['43453453', '234234234'];
  console.log(imageArray);

  const { documents } = data;

  return (
    <StyledDocuments>
      <header className="clearfix">
        <Button id="buttonId" onClick={addDocumentMutation}>
          Congrats
        </Button>
      </header>
      {documents && documents.length ? (
        <div>
          <DocumentsList>
            {documents.map(({ _id, isPublic, title, updatedAt }) => (
              <div key={_id}>
                <Button onClick={() => resizeDocumentMutation({ variables: { listBodies: buggedArray[0] } })}>
                  Resize it
                </Button>
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
