CREATE TABLE IF NOT EXISTS routes (
  route_id TEXT PRIMARY KEY,
  route_short_name TEXT NOT NULL,
  route_long_name TEXT NOT NULL,
  route_color TEXT,
  route_text_color TEXT
);

CREATE TABLE IF NOT EXISTS stops (
  stop_id TEXT PRIMARY KEY,
  stop_name TEXT NOT NULL,
  stop_desc TEXT,
  stop_lat DOUBLE PRECISION NOT NULL,
  stop_lon DOUBLE PRECISION NOT NULL,
  parent_station_id TEXT
);

CREATE TABLE IF NOT EXISTS service_calendars (
  service_id TEXT PRIMARY KEY,
  monday BOOLEAN NOT NULL,
  tuesday BOOLEAN NOT NULL,
  wednesday BOOLEAN NOT NULL,
  thursday BOOLEAN NOT NULL,
  friday BOOLEAN NOT NULL,
  saturday BOOLEAN NOT NULL,
  sunday BOOLEAN NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_exceptions (
  service_id TEXT NOT NULL,
  date TEXT NOT NULL,
  exception_type SMALLINT NOT NULL,
  PRIMARY KEY (service_id, date)
);

CREATE TABLE IF NOT EXISTS trips (
  trip_id TEXT PRIMARY KEY,
  route_id TEXT NOT NULL REFERENCES routes(route_id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES service_calendars(service_id) ON DELETE CASCADE,
  shape_id TEXT,
  trip_headsign TEXT
);

CREATE TABLE IF NOT EXISTS stop_times (
  trip_id TEXT NOT NULL REFERENCES trips(trip_id) ON DELETE CASCADE,
  stop_id TEXT NOT NULL REFERENCES stops(stop_id) ON DELETE CASCADE,
  stop_sequence INTEGER NOT NULL,
  arrival_time TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  stop_headsign TEXT,
  pickup_type SMALLINT,
  drop_off_type SMALLINT,
  PRIMARY KEY (trip_id, stop_sequence)
);

CREATE TABLE IF NOT EXISTS shape_points (
  shape_id TEXT NOT NULL,
  shape_pt_sequence INTEGER NOT NULL,
  shape_pt_lat DOUBLE PRECISION NOT NULL,
  shape_pt_lon DOUBLE PRECISION NOT NULL,
  shape_dist_traveled DOUBLE PRECISION,
  PRIMARY KEY (shape_id, shape_pt_sequence)
);

CREATE INDEX IF NOT EXISTS idx_stops_location ON stops USING gist (
  ll_to_earth(stop_lat, stop_lon)
);
