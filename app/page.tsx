import Map from "./components/Map";

import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <Map mapClassName={styles.map} sidebarClassName={styles.sidebar} />
    </main>
  );
}
