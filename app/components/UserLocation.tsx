import useGeolocation from "@/lib/useGeolocation";

import styles from "./UserLocation.module.scss";

export default function UserLocation() {
  const [curPos, geoError] = useGeolocation();

  // const handleButtonClick = (e) => {};

  return (
    <div className={styles["user-location"]}>
      {!curPos && (
        <button
        // onClick={handleButtonClick}
        ></button>
      )}
      {geoError && <div>{geoError.message}</div>}
    </div>
  );
}
