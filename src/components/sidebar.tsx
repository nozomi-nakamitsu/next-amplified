import { Auth } from "aws-amplify";
import styles from "../../styles/Sidebar.module.css";
import ModalCreate from "../components/ModalCreate";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/dist/client/router";

const Sidebar = () => {
  const [user, setUser] = useState({ name: "", picture: "", email: "" });
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const openFunc = () => {
    setIsOpen(true);
  };
  const closeFunc = () => {
    setIsOpen(false);
  };
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
  const signOut = () => {
    try {
      Auth.signOut();
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <div className={styles.container}>
        <div className={styles.item}>
          <div className={styles.image}>
            <img src={user.picture} alt="" className={styles.img} />
          </div>
          <p>{user.name}さん</p>
          <p></p>
        </div>
        <div className={styles.footer}>
          <p className={styles.link} onClick={openFunc}>
            新規作成
          </p>
          <p className={styles.link} onClick={signOut}>
            ログアウト
          </p>
        </div>
      </div>
      <ModalCreate isOpen={isOpen} closeFunc={closeFunc} />
    </>
  );
};

export default Sidebar;
