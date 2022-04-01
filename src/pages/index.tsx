import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { FiUser, FiCalendar } from 'react-icons/fi';

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
  function loadMorePosts() {}

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {/* <Link href="#">
            <a>
              <strong className={styles.title}>Você sabe o que é React?</strong>
              <p className={styles.description}>
                Descubra uma das tecnologias mais requisitadas da atualidade
              </p>
              <div className={commonStyles.infoContainer}>
                <time className={commonStyles.verticallyAlligned}>
                  <FiCalendar className={commonStyles.icon} /> 15 Mar 2021
                </time>
                <span className={commonStyles.verticallyAlligned}>
                  <FiUser className={commonStyles.icon} /> Santiago Monteiro
                </span>
              </div>
            </a>
          </Link>
          <Link href="#">
            <a>
              <strong className={styles.title}>Você sabe o que é React?</strong>
              <p className={styles.description}>
                Descubra uma das tecnologias mais requisitadas da atualidade
              </p>
              <div className={commonStyles.infoContainer}>
                <time className={commonStyles.verticallyAlligned}>
                  <FiCalendar className={commonStyles.icon} /> 15 Mar 2021
                </time>
                <span className={commonStyles.verticallyAlligned}>
                  <FiUser className={commonStyles.icon} /> Santiago Monteiro
                </span>
              </div>
            </a>
          </Link> */}
          <button onClick={postsPagination.next_page && loadMorePosts}>
            carregar mais posts
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
