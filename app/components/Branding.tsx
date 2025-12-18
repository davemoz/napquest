import { FC } from "react";

import styles from "./Branding.module.scss";

const Branding: FC = () => {
  return (
    <>
      <div className={styles.logo}>NapQuest</div>
      <div className={styles.description}>Plan your nap.</div>
    </>
  );
};

export default Branding;
