"use client";

import classNames from "classnames";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
import DragAndDropItem from "./DragAndDropItem";
import CurrentLocationInput from "./CurrentLocationInput";

export default function DragAndDropRoutes({
  route,
  onDelete,
  onReorder,
  curPos,
  manualStart,
  map,
  onStartSelect,
  routes,
  selectedRouteIndex,
  onRouteSelect,
  handleRetrieve,
}: {
  route: SearchBoxFeatureSuggestion[];
  onDelete: (id: string) => void;
  onReorder: (route: SearchBoxFeatureSuggestion[]) => void;
  curPos: number[] | undefined;
  manualStart?: SearchBoxFeatureSuggestion;
  map?: any;
  onStartSelect?: (res: SearchBoxRetrieveResponse) => void;
  routes?: any[];
  selectedRouteIndex?: number;
  onRouteSelect?: (index: number) => void;
  handleRetrieve?: (res: SearchBoxRetrieveResponse) => void;
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
    <div className={styles["routes-flow"]}>
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
            <CurrentLocationInput
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

      <div
        className={classNames(styles["search-container"], {
          [styles["has-no-route"]]: route.length === 0,
        })}
      >
        <SearchBox
          accessToken={process.env.MAP_BOX_API_KEY!}
          map={map}
          onRetrieve={handleRetrieve}
          placeholder={
            route.length > 0 ? "Add a stop" : "Where would you like to go?"
          }
          theme={{
            variables: {
              unit: "var(--searchbox-unit)",
              borderRadius: "var(--searchbox-borderRadius)",
              border: "var(--searchbox-border)",
              boxShadow: "var(--searchbox-boxShadow)",
              padding: "var(--searchbox-padding)",
              colorBackground: "var(--searchbox-bg)",
              colorText: "#111827",
              colorBackgroundHover: "var(--searchbox-hover-bg)",
              fontFamily: "inherit",
            },
          }}
        />
      </div>

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
    </div>
  );
}
