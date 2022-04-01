import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FiUser, FiCalendar } from 'react-icons/fi';
import { useState } from 'react';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  console.log(
    format(new Date(), 'dd MMM yyyy', {
      locale: ptBR,
    })
  );

  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  const [pagination, setPagination] = useState<String | null>(
    postsPagination.next_page
  );

  function loadMorePosts() {
    if (pagination) {
      fetch(`${pagination}`)
        .then(response => response.json())
        .then(data => {
          setPosts([...posts, ...data.results]);
          setPagination(data.next_page);
        });
    }
  }

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => {
            const formattedPublicationDate = format(
              new Date(post.first_publication_date),
              'dd MMM yyy',
              {
                locale: ptBR,
              }
            );

            const fullyFormattedPublicationDate =
              formattedPublicationDate.slice(0, 3) +
              formattedPublicationDate[3].toUpperCase() +
              formattedPublicationDate.slice(4);

            return (
              <Link href={`post/${post.uid}`} key={post.uid}>
                <a>
                  <strong className={styles.title}>{post.data.title}</strong>
                  <p className={styles.description}>{post.data.subtitle}</p>
                  <div className={commonStyles.infoContainer}>
                    <time className={commonStyles.verticallyAlligned}>
                      <FiCalendar className={commonStyles.icon} />
                      {fullyFormattedPublicationDate}
                    </time>
                    <span className={commonStyles.verticallyAlligned}>
                      <FiUser className={commonStyles.icon} />
                      {post.data.author}
                    </span>
                  </div>
                </a>
              </Link>
            );
          })}
          <button
            className={`${pagination ? styles.active : styles.hidden} ${
              styles.loadButton
            }`}
            onClick={() => loadMorePosts()}
          >
            Carregar mais posts
          </button>
        </div>
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
