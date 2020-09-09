import React from 'react';
import { Button } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { documents as documentsQuery } from '../../queries/Documents.gql';
import { addDocument } from '../../mutations/Documents.gql';
import { timeago } from '../../../modules/dates';
import BlankState from '../../components/BlankState';
import Loading from '../../components/Loading';
import { Document, DocumentsList, StyledDocuments } from '../DocumentsUseQueryUseMutation/styles';

const DocumentsUseQueryUseMutation = () => {
  const history = useHistory();
  const { loading, data, error } = useQuery(documentsQuery);
  const [addDocumentMutation] = useMutation(addDocument, {
    refetchQueries: [{ query: documentsQuery }],
    onCompleted: (mutation) => {
      history.push(`/documents/${mutation.addDocument._id}/edit`);
    },
  });

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <pre>{error}</pre>;
  }

  const { documents } = data;

  return (
    <StyledDocuments>
      <header className="clearfix">
        <Button bsStyle="success" onClick={addDocumentMutation}>
          New Document
        </Button>
      </header>
      {documents?.length ? (
        <DocumentsList>
          {documents.map(({ _id, isPublic, title, updatedAt }) => (
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
          ))}
        </DocumentsList>
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
