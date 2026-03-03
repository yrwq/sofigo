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

export type ApiRouteSummary = {
  id: string;
  shortName: string;
  longName: string;
  color: string | null;
  textColor: string | null;
};

export type ApiNearbyStop = {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lon: number;
  parentStationId: string | null;
  distanceMeters: number;
};

export type ApiStopDeparture = {
  tripId: string;
  routeId: string;
  routeShortName: string;
  routeLongName: string;
  headsign: string | null;
  arrivalTime: string;
  departureTime: string;
  stopSequence: number;
};

export type ApiRouteTrip = {
  id: string;
  headsign: string | null;
  firstStopId: string | null;
  firstStopName: string | null;
  firstArrivalTime: string | null;
  firstDepartureTime: string | null;
  lastStopId: string | null;
  lastStopName: string | null;
  lastArrivalTime: string | null;
  lastDepartureTime: string | null;
  currentStopId: string | null;
  currentStopName: string | null;
  currentArrivalTime: string | null;
  currentDepartureTime: string | null;
  isActive: boolean;
  isPast: boolean;
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

export type ApiTripStopTime = {
  stopId: string;
  stopName: string;
  stopDescription: string | null;
  lat: number;
  lon: number;
  parentStationId: string | null;
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

export type ApiShapePoint = {
  shapeId: string;
  sequence: number;
  lat: number;
  lon: number;
  distTraveled: number | null;
};
