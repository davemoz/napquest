import { Button } from "react-aria-components";
import { DragHandleIcon, CloseIcon } from "@chakra-ui/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import styles from "./RouteCard.module.scss";
import { SearchBoxFeatureSuggestion } from "@mapbox/search-js-core";

const DragAndDropItem = ({
  item,
  onPressDelete,
}: {
  item: SearchBoxFeatureSuggestion;
  onPressDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item.properties.mapbox_id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className={styles["route-slot"]}>
      <div
        className={styles["route-card"]}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <Button className={styles["route-item-drag-button"]}>
          <DragHandleIcon className={styles["route-item-drag-icon"]} />
        </Button>
        <div className={styles["route-item-info"]}>
          <div className={styles["route-item-name"]}>
            {item.properties.name}
          </div>
          <div className={styles["route-item-address"]}>
            {item.properties.address}
          </div>
        </div>
        <Button
          aria-label="Remove from list"
          className={styles["route-item-delete-button"]}
          onPress={() => onPressDelete(item.properties.mapbox_id)}
        >
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
};

export default DragAndDropItem;
