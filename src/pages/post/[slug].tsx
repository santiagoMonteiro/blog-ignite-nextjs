import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useState } from "react";

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const [contentWithHtml, setContentWithHtml] = useState(() => {
    return post.data.content.map(contentChunk => {
      return {
        heading: contentChunk.heading,
        body: [
          {
            text: RichText.asHtml(contentChunk.body),
          },
          {
            text: RichText.asText(contentChunk.body),
          },
        ],
      };
    });
  });

  function getFormattedPublicationDate(publicationDate) {
    const formattedPublicationDate = format(
      new Date(publicationDate),
      'dd MMM yyy',
      {
        locale: ptBR,
      }
    );

    // const fullyFormattedPublicationDate =
    //   formattedPublicationDate.slice(0, 3) +
    //   formattedPublicationDate[3].toUpperCase() +
    //   formattedPublicationDate.slice(4);

    return formattedPublicationDate;
  }

  function getMinutesOfReading() {
    const wordsPerMinute = 200;

    const sumOfWords = contentWithHtml.reduce((acc, cur) => {
      const sumOfHeadingWords = cur.heading ? cur.heading.split(' ').length : 0;
      const sumOfBodyWords = cur.body[0].text
        ? cur.body[0].text.split(' ').length
        : 0;

      return acc + sumOfHeadingWords + sumOfBodyWords;
    }, 0);

    return Math.ceil(sumOfWords / wordsPerMinute);
  }

  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className={styles.bannerContainer}>
        <img className={styles.banner} src={post.data.banner.url} alt="" />
      </div>

      <main className={commonStyles.container}>
        <article className={styles.postContainer}>
          <h1 className={styles.title}>{post.data.title}</h1>
          <div className={commonStyles.infoContainer}>
            <time className={commonStyles.verticallyAlligned}>
              <FiCalendar className={commonStyles.icon} />
              {getFormattedPublicationDate(post.first_publication_date)}
            </time>
            <span className={commonStyles.verticallyAlligned}>
              <FiUser className={commonStyles.icon} />
              {post.data.author}
            </span>
            <time className={commonStyles.verticallyAlligned}>
              <FiClock className={commonStyles.icon} />
              <span>{`${getMinutesOfReading()} min`}</span>
            </time>
          </div>

          <div className={styles.content}>
            {contentWithHtml.map((contentChunk, index) => {
              return (
                <div key={index}>
                  <h2>{contentChunk.heading}</h2>
                  <div
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{
                      __html: contentChunk.body[0].text,
                    }}
                  ></div>
                </div>
              );
            })}
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {

  const prismic = getPrismicClient();
  const slug = context.params.slug;
  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = response;

  return {
    props: { post },
  };
};
