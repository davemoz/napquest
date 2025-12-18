import MapWrapper from "./components/MapWrapper";

import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <MapWrapper mapClassName={styles.map} sidebarClassName={styles.sidebar} />
    </main>
  );
}
