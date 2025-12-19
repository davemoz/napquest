"use client";

import classNames from "classnames";
import { Button } from "react-aria-components";
import { DragHandleIcon, CloseIcon } from "@chakra-ui/icons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SearchBoxFeatureSuggestion,
  SearchBoxRetrieveResponse,
} from "@mapbox/search-js-core";

import dynamic from "next/dynamic";

const SearchBox = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.SearchBox),
  { ssr: false }
);

import styles from "./DragAndDropRoutes.module.scss";

export default function DragAndDropRoutes({
  route,
  onDelete,
  onReorder,
  curPos,
  manualStart,
  onStartSelect,
  routes,
  selectedRouteIndex,
  onRouteSelect,
}: {
  route: SearchBoxFeatureSuggestion[];
  onDelete: (id: string) => void;
  onReorder: (route: SearchBoxFeatureSuggestion[]) => void;
  curPos: number[] | undefined;
  manualStart?: SearchBoxFeatureSuggestion;
  onStartSelect?: (res: SearchBoxRetrieveResponse) => void;
  routes?: any[];
  selectedRouteIndex?: number;
  onRouteSelect?: (index: number) => void;
}) {
  const handleRemoveItem = (id: string) => {
    onDelete(id);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = route.findIndex(
        (item) => item.properties.mapbox_id === active.id
      );
      const newIndex = route.findIndex(
        (item) => item.properties.mapbox_id === over.id
      );

      const reorderedRoute = arrayMove(route, oldIndex, newIndex);
      onReorder(reorderedRoute);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={route.map((item) => item.properties.mapbox_id)}
          strategy={verticalListSortingStrategy}
        >
          <div aria-label="Route list" className={styles["route-list"]}>
            <CurrentLocationOptionalInput
              curPos={curPos}
              manualStart={manualStart}
              onStartSelect={onStartSelect}
            />
            {route.length > 0 && (
              <>
                {route.map((item) => (
                  <DragAndDropItem
                    item={item}
                    key={item.properties.mapbox_id}
                    onPressDelete={handleRemoveItem}
                  />
                ))}
              </>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {routes && routes.length > 1 && (
        <div className={styles["route-selector"]}>
          {routes.map((r, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles["route-option"]} ${
                idx === selectedRouteIndex ? styles["selected"] : ""
              }`}
              onClick={() => onRouteSelect?.(idx)}
            >
              Option {idx + 1}
              <br />
              <span className={styles["route-time"]}>
                {Math.round(r.duration / 60)} min
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

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
    <div
      className={styles["route-item"]}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Button className={styles["route-item-drag-button"]}>
        <DragHandleIcon className={styles["route-item-drag-icon"]} />
      </Button>
      <div className={styles["route-item-info"]}>
        <div className={styles["route-item-name"]}>{item.properties.name}</div>
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
  );
};

const CurrentLocationOptionalInput = ({
  curPos,
  manualStart,
  onStartSelect,
}: {
  curPos: number[] | undefined;
  manualStart?: SearchBoxFeatureSuggestion;
  onStartSelect?: (res: SearchBoxRetrieveResponse) => void;
}) => {
  if (curPos) {
    return (
      <div
        className={classNames(styles["route-item"], styles["current-location"])}
      >
        <div className={styles["location-status"]}>
          <div className={styles["geo-indicator-yes"]} />
        </div>
        <div className={styles["route-item-info"]}>
          <div className={styles["route-item-name"]}>Current Location</div>
          <div className={styles["route-item-address"]}>
            Using device location
          </div>
        </div>
      </div>
    );
  }

  // Fallback to manual input if no curPos
  return (
    <div
      className={classNames(styles["route-item"], styles["current-location"])}
    >
      <div className={styles["location-status"]}>
        {!manualStart && <div className={styles["geo-indicator-no"]} />}
      </div>
      <div className={styles["search-box-container"]}>
        <SearchBox
          accessToken={process.env.MAP_BOX_API_KEY!}
          onRetrieve={onStartSelect}
          placeholder="Enter start location"
          value={manualStart ? manualStart.properties.name : ""}
          theme={{
            variables: {
              unit: "var(--searchbox-unit)",
              padding: "var(--searchbox-padding)",
              borderRadius: "var(--searchbox-borderRadius)",
              border: "var(--searchbox-border)",
              boxShadow: "var(--searchbox-boxShadow)",
            },
          }}
        />
      </div>
    </div>
  );
};
