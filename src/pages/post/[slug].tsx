/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <>
      <Header />
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>
      <main className={commonStyles.container}>
        <div className={styles.content}>
          <h1>{post.data.title}</h1>
          <div className={styles.icons}>
            <time>
              <FiCalendar />
              {post.first_publication_date}
            </time>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <span>
              <FiClock />
              {`${Math.ceil(
                RichText.asText(post.data.content[0].body[0].text).split(' ')
                  .length / 200
              )} min`}
            </span>
          </div>
          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{
              __html: RichText.asHtml(post.data.content[0].body[0].text),
            }}
          />
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  //   const prismic = getPrismicClient();
  //   const posts = await prismic.query(TODO);
  //   // TODO
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy'
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: [
        {
          heading: response.data.content[0].heading,
          body: [
            {
              text: response.data.content[0].body,
            },
          ],
        },
      ],
    },
  };

  return {
    props: {
      post,
      redirect: 60 * 30, // 30 minutes
    },
  };
};
