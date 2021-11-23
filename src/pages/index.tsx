import Amplify, { withSSRContext } from "aws-amplify";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import styles from "../../styles/Home.module.css";
import { ListTodosQuery, Todo } from "../API";
import { listTodos } from "../graphql/queries";
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import awsExports from "../aws-exports";
import Sidebar from "../components/sidebar";

Amplify.configure({ ...awsExports, ssr: true });

export default function Home({ todos = [] }: { todos: Todo[] }) {
  return (
    <AmplifyAuthenticator>
      <Head>
        <title>Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <Sidebar></Sidebar>

        <div>
          {todos.map((todo, index) => (
            <div className={styles.card} key={index}>
              <a href={`/todo/${todo.id}`} key={todo.id}>
                <h3 className={styles.title}>{todo.name}</h3>
                <p>{todo.description}</p>
              </a>
            </div>
          ))}
        </div>
      </div>
    </AmplifyAuthenticator>
  );
}
// getServerSidePropsとは、「getInitialPropsをサーバサイドだけで実行するようにしたもの
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const SSR = withSSRContext({ req });

  const response = (await SSR.API.graphql({ query: listTodos })) as {
    data: ListTodosQuery;
  };

  return {
    props: {
      todos: response.data.listTodos.items,
    },
  };
};
