"use client";

import { useState } from "react";
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
  DragEndEvent,
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
}: {
  route: SearchBoxFeatureSuggestion[];
  onDelete: (id: string) => void;
  onReorder: (reorderedRoute: SearchBoxFeatureSuggestion[]) => void;
  curPos: number[] | undefined;
  manualStart?: SearchBoxFeatureSuggestion;
  onStartSelect?: (res: SearchBoxRetrieveResponse) => void;
}) {
  const handleRemoveItem = (id: string) => {
    onDelete(id);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = route.findIndex(
        (item) => item.properties.mapbox_id === active.id.toString()
      );
      const newIndex = route.findIndex(
        (item) => item.properties.mapbox_id === over?.id.toString()
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedRoute = arrayMove(route, oldIndex, newIndex);
        onReorder(reorderedRoute);
      }
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
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
      {/* 
          We disable drag handle for now if the library issues with dnd-kit aren't resolved.
          But assuming drag works or we fix it later. 
          Actually the button is the handle here.
       */}
      <Button className={styles["route-item-drag-button"]}>
        <DragHandleIcon />
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
  // If curPos is available, we prioritize it and show "Current Location" static text.
  // The SearchBox is only shown if curPos is missing.
  // We still respect manualStart if it exists (e.g. if we add a 'change' button later),
  // but per requirements, we primarily toggle based on curPos availability.

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
        <div className={styles["geo-indicator-no"]} />
      </div>
      <div className={styles["search-box-container"]}>
        <SearchBox
          accessToken={process.env.NEXT_PUBLIC_MAP_BOX_API_KEY!}
          onRetrieve={onStartSelect}
          placeholder="Enter start location"
          value={manualStart ? manualStart.properties.name : ""}
          theme={{
            variables: {
              unit: "var(--searchbox-unit)",
              padding: "var(--searchbox-padding)",
              borderRadius: "var(--searchbox-border-radius)",
              border: "var(--searchbox-border)",
              boxShadow: "var(--searchbox-box-shadow)",
            },
          }}
        />
      </div>
    </div>
  );
};
