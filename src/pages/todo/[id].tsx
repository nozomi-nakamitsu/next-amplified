import Amplify, { API, withSSRContext } from "aws-amplify";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import React from "react";
import styles from "../../../styles/Home.module.css";
import { ListTodosQuery, Todo, GetTodoQuery } from "../../API";
import { listTodos } from "../../graphql/queries";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import awsExports from "../../aws-exports";
import { getTodo } from "../../graphql/queries";
import { useRouter } from "next/dist/client/router";
import { DeleteTodoInput } from "../../API";
import { deleteTodo } from "../../graphql/mutations";

Amplify.configure({ ...awsExports, ssr: true });

export default function TodoPage({ todo }: { todo: Todo }) {
  const router = useRouter();
  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Loading&hellip;</h1>
      </div>
    );
  }
  async function handleDelete(): Promise<void> {
    try {
      const deleteInput: DeleteTodoInput = {
        id: todo.id,
      };
      await API.graphql({
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        query: deleteTodo,
        variables: {
          input: deleteInput,
        },
      });
      router.push("/");
    } catch ({ errors }) {
      console.error(...errors);
      throw new Error(errors[0].message);
    }
  }
  function redirect() {
    console.log("aaa");
    router.push("/");
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{todo.name} – Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{todo.name}</h1>
        <p className={styles.description}>{todo.description}</p>
      </main>

      <footer>
        <button onClick={handleDelete}>💥 Delete todo</button>
        <button onClick={redirect}>Home</button>
      </footer>
    </div>
  );
}
// getStaticPathsはDynamic Routes利用時にも静的なファイルを生成するためのAPI。

export const getStaticPaths: GetStaticPaths = async () => {
  const SSR = withSSRContext();

  const todosQuery = (await SSR.API.graphql({
    query: listTodos,
    authMode: GRAPHQL_AUTH_MODE.API_KEY,
  })) as { data: ListTodosQuery; errors: any[] };

  const paths = todosQuery.data.listTodos.items.map((todo: Todo) => ({
    params: { id: todo.id },
  }));

  return {
    fallback: true,
    paths,
  };
};

// getStaticPropsはgetInitialPropsが行っていた処理をビルド時に行い、静的なファイルを事前に生成するためのAPI。
// ビルド時に実行される
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const SSR = withSSRContext();
  const response = (await SSR.API.graphql({
    query: getTodo,
    variables: {
      id: params.id,
    },
  })) as { data: GetTodoQuery };

  return {
    props: {
      todo: response.data.getTodo,
    },
  };
};
