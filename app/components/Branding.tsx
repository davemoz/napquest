import { FC } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { useSettings } from "../context/SettingsContext";
import SettingsModal from "./SettingsModal";
import styles from "./Branding.module.scss";

const Branding: FC = () => {
  const { setShowSettings } = useSettings();

  return (
    <div className={styles.container}>
      <div className={styles["header-row"]}>
        <div>
          <div className={styles.logo}>NapQuest</div>
          <div className={styles.description}>Plan your nap.</div>
        </div>
        <button
          className={styles["settings-button"]}
          onClick={() => setShowSettings(true)}
          aria-label="Information"
        >
          <FaInfoCircle />
        </button>
      </div>
      <SettingsModal />
    </div>
  );
};

export default Branding;
