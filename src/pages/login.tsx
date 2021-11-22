import Amplify, { API, Auth, withSSRContext } from "aws-amplify";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import React, { useState } from "react";
import styles from "../../styles/Login.module.css";
import loginStyles from "../../styles/Login.module.css";

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
import { redirect } from "next/dist/server/api-utils";

Amplify.configure({ ...awsExports, ssr: true });

export default function Login() {
  const router = useRouter();

  const [state, setState] = useState({ username: "", password: "" });

  async function signIn() {
    try {
      const user = await Auth.signIn(state.username, state.password);
      router.push("/");
    } catch (error) {
      console.log("error signing in", error);
    }
  }

  // フォーム内を監視
  const handleInputChange = (e) => {
    const name = e.target.name;
    setState({ ...state, [name]: e.target.value });
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <p className={styles.title}>login</p>
        <div className={styles.item}>
          <div className={styles.label}>username</div>
          <input
            type="text"
            name="username"
            id=""
            className={styles.input}
            onChange={handleInputChange}
          />
        </div>
        <div className={styles.item}>
          <div className={styles.label}>password</div>
          <input
            type="password"
            name="password"
            id=""
            className={styles.input}
            onChange={handleInputChange}
          />
        </div>
        <div className={(styles.item, styles.footer)}>
          <button className={styles.button} onClick={signIn}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
