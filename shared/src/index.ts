export type TransitRoute = {
  id: string;
  shortName: string;
  longName: string;
  color: string | null;
  textColor: string | null;
};

export type StopLocation = {
  lat: number;
  lon: number;
};

export type TransitStop = {
  id: string;
  name: string;
  description: string | null;
  location: StopLocation;
  parentStationId: string | null;
};

export type ServiceCalendar = {
  id: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  startDate: string;
  endDate: string;
};

export type ServiceException = {
  serviceId: string;
  date: string;
  exceptionType: 1 | 2;
};

export type TransitTrip = {
  id: string;
  routeId: string;
  serviceId: string;
  shapeId: string | null;
  headsign: string | null;
};

export type TripStopTime = {
  tripId: string;
  stopId: string;
  stopSequence: number;
  arrivalTime: string;
  departureTime: string;
  stopHeadsign: string | null;
  pickupType: number | null;
  dropOffType: number | null;
};

export type ShapePoint = {
  shapeId: string;
  sequence: number;
  location: StopLocation;
  distanceTraveledKm: number | null;
};
