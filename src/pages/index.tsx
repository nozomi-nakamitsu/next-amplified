import Amplify, { API, Auth, withSSRContext } from "aws-amplify";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useEffect, useState, useCallback } from "react";
import styles from "../../styles/Home.module.css";

import {
  CreateTodoInput,
  CreateTodoMutation,
  ListTodosQuery,
  Todo,
} from "../API";
import { createTodo } from "../graphql/mutations";
import { listTodos } from "../graphql/queries";
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api";
import awsExports from "../aws-exports";
import { useRouter } from "next/dist/client/router";
import Sidebar from "../components/sidebar";

Amplify.configure({ ...awsExports, ssr: true });

export default function Home({ todos = [] }: { todos: Todo[] }) {
  const [user, setUser] = useState({ name: "", picture: "", email: "" });
  const getUser = useCallback(async () => {
    const response = await Auth.currentAuthenticatedUser();
    if (response) {
      setUser({
        name: response.attributes.name,
        picture: response.attributes.picture,
        email: response.attributes.email,
      });
    }
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const router = useRouter();
  async function handleCreateTodo(event) {
    event.preventDefault();

    const form = new FormData(event.target);

    try {
      const createInput: CreateTodoInput = {
        name: form.get("title").toString(),
        description: form.get("content").toString(),
      };

      const request = (await API.graphql({
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        query: createTodo,
        variables: {
          input: createInput,
        },
      })) as { data: CreateTodoMutation; errors: any[] };

      router.push(`/todo/${request.data.createTodo.id}`);
    } catch ({ errors }) {
      console.error(...errors);
      throw new Error(errors[0].message);
    }
  }

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
