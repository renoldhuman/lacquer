-- Enable UUID generation if you want automatic ids
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

------------------------------------------------------------
-- USER
------------------------------------------------------------
CREATE TABLE users (
    user_id      uuid PRIMARY KEY,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    username     text        NOT NULL,
    email        text        NOT NULL UNIQUE
);

------------------------------------------------------------
-- PRIORITY (lookup / enum-ish table)
------------------------------------------------------------
CREATE TABLE priorities (
    priority_level text PRIMARY KEY
);

------------------------------------------------------------
-- PROJECT
-- One User -> Many Projects
------------------------------------------------------------
CREATE TABLE projects (
    project_id          uuid PRIMARY KEY,
    user_id             uuid        NOT NULL REFERENCES users (user_id),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    project_name        text        NOT NULL,
    project_description text
);

------------------------------------------------------------
-- TASK NOTE
-- One Task -> One TaskNote
------------------------------------------------------------
CREATE TABLE task_notes (
    task_note_id        uuid PRIMARY KEY,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    task_note_content   text        NOT NULL
);

------------------------------------------------------------
-- LOCATION
-- One User -> Many Locations
-- Self-referencing sub_location_id -> location_id
------------------------------------------------------------
CREATE TABLE locations (
    location_id      uuid PRIMARY KEY,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now(),
    longitude        numeric,              -- Decimal in the diagram
    latitude         numeric,
    radius           integer     NOT NULL, -- Geofence radius in meters
    user_id          uuid        NOT NULL REFERENCES users (user_id),
    location_name    text        NOT NULL,
    sub_location_id  uuid REFERENCES locations (location_id)
);

------------------------------------------------------------
-- INVENTORY
-- One User -> Many Inventories
-- One Location -> One Inventory
------------------------------------------------------------
CREATE TABLE inventories (
    inventory_id  uuid PRIMARY KEY,
    location_id   uuid UNIQUE REFERENCES locations (location_id),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    user_id       uuid        NOT NULL REFERENCES users (user_id)
);

------------------------------------------------------------
-- INVENTORY ITEM
-- One Inventory -> Many InventoryItems
------------------------------------------------------------
CREATE TABLE inventory_items (
    inventory_id  uuid        NOT NULL REFERENCES inventories (inventory_id),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    name          text        NOT NULL,
    location_id   uuid REFERENCES locations (location_id),

    -- Composite key since the diagram doesn’t show a separate id
    PRIMARY KEY (inventory_id, name)
);

------------------------------------------------------------
-- TASK
-- One Project -> Many Tasks
-- One Task -> One Location
-- One Task -> One TaskNote
-- (Many Tasks -> One Priority, even though the diagram labels 1-1)
------------------------------------------------------------
CREATE TABLE tasks (
    task_id          uuid PRIMARY KEY,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now(),
    task_description text        NOT NULL,

    project_id       uuid        NOT NULL REFERENCES projects (project_id),

    -- Priority is a lookup to priorities.priority_level
    priority_level   text REFERENCES priorities (priority_level),

    -- One-to-one with Location
    location_id      uuid REFERENCES locations (location_id),

    -- One-to-one with TaskNote
    task_note_id     uuid UNIQUE REFERENCES task_notes (task_note_id)
);

