"use client";

import { ChangeEvent, ChangeEventHandler, useState } from "react";
import classNames from "classnames";
import { Button } from "react-aria-components";
import { CheckIcon, DragHandleIcon } from "@chakra-ui/icons";
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
import { SearchBoxFeatureSuggestion } from "@mapbox/search-js-core";

import useMapboxGL from "@/lib/useMapboxGL";

import styles from "./DragAndDropRoutes.module.scss";

export default function DragAndDropRoutes({
  route,
  onDelete,
  map,
  curPos,
}: {
  route: SearchBoxFeatureSuggestion[];
  onDelete: (id: string) => void;
  map: any;
  curPos: number[] | undefined;
}) {
  const [manualCurPos, setManualCurPos] = useState();
  const [itemIds, setItemIds] = useState(
    route.map((item) => item.properties.mapbox_id)
  );
  const handleRemoveItem = (id: string) => {
    onDelete(id);
  };
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItemIds((itemIds) => {
        const oldIndex = itemIds.indexOf(active.id.toString());
        /* @ts-ignore */
        const newIndex = itemIds.indexOf(over.id.toString());

        return arrayMove(itemIds, oldIndex, newIndex);
      });
    }
  }
  function handleSetNewCurrent(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    const manualCurPosCoords = undefined; // TODO: Make mapbox search request for new current location
    setManualCurPos(manualCurPosCoords);
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
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {route.length > 0 && (
          <div aria-label="Route list" className={styles["route-list"]}>
            <CurrentLocationOptionalInput
              setNewCurrent={handleSetNewCurrent}
              curPos={curPos}
            />
            {route.map((item) => (
              <DragAndDropItem
                item={item}
                key={item.properties.mapbox_id}
                onPressDelete={handleRemoveItem}
              />
            ))}
          </div>
        )}
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
        X
      </Button>
    </div>
  );
};

const CurrentLocationOptionalInput = ({
  setNewCurrent,
  curPos,
}: {
  setNewCurrent: ChangeEventHandler;
  curPos: number[] | undefined;
}) => {
  return (
    <div
      className={classNames(styles["route-item"], styles["current-location"])}
    >
      <div className={styles["location-status"]}>
        <div
          className={
            curPos ? styles["geo-indicator-yes"] : styles["geo-indicator-no"]
          }
        />
      </div>
      <input
        className={styles["current-location-input"]}
        onChange={setNewCurrent}
        placeholder={curPos ? "Current location" : "Enter start location"}
      />
    </div>
  );
};
