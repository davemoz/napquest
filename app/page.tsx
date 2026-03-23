import MapWrapper from "./components/MapWrapper";

import styles from "./page.module.scss";

export const dynamic = "force-dynamic";

export default function Home() {
  const token = process.env.MAP_BOX_API_KEY || "";
  
  return (
    <main className={styles.main}>
      <MapWrapper mapClassName={styles.map} sidebarClassName={styles.sidebar} mapboxToken={token} />
    </main>
  );
}
