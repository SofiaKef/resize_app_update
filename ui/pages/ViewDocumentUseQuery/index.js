import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import SEO from '../../components/SEO';
import BlankState from '../../components/BlankState';
import Comments from '../../components/Comments';
import { document as documentQuery } from '../../queries/Documents.gql';
import parseMarkdown from '../../../modules/parseMarkdown';

import { DocumentBody, StyledViewDocument } from './styles';
import Loading from '../../components/Loading';

const ViewDocumentUseQuery = () => {
  console.log('## render ViewDocumentUseQuery');
  const [sortBy, setSortBy] = useState('newestFirst');
  const params = useParams();
  const { data, loading, error, refetch } = useQuery(documentQuery, {
    variables: {
      _id: params._id,
      sortBy: 'newestFirst',
    },
  });

  const handleChangeCommentSort = (event) => {
    event.persist();
    setSortBy(event.target.value);
    refetch({ sortBy: event.target.value });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <pre>{error}</pre>;
  }

  const { document } = data;

  if (!document) {
    return (
      <BlankState
        icon={{ style: 'solid', symbol: 'file-alt' }}
        title="No document here, friend!"
        subtitle="Make sure to double check the URL! If it's correct, this is probably a private document."
      />
    );
  }

  return (
    <React.Fragment>
      <StyledViewDocument>
        <SEO
          title={document?.title}
          description={document?.body}
          url={`documents/${document?._id}`}
          contentType="article"
          published={document?.createdAt}
          updated={document?.updatedAt}
          twitter="clvrbgl"
        />
        <React.Fragment>
          <h1>{document?.title}</h1>
          <DocumentBody
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(document?.body),
            }}
          />
        </React.Fragment>
      </StyledViewDocument>
      <Comments
        documentId={document?._id}
        comments={document?.comments}
        sortBy={sortBy}
        onChangeSortBy={handleChangeCommentSort}
      />
    </React.Fragment>
  );
};

ViewDocumentUseQuery.propTypes = {};

export default ViewDocumentUseQuery;
