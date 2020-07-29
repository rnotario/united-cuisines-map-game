import React from "react";
import { Map as LeafletMap, GeoJSON, Marker } from "react-leaflet";

import geoJSON from "../custom.geo.json";

const Map = ({ cityMarker, userMarker, onClick }) => {
  return (
    <LeafletMap
      center={[50, 10]}
      zoom={3}
      minZoom={3}
      maxZoom={7}
      attributionControl={true}
      zoomControl={true}
      doubleClickZoom={true}
      scrollWheelZoom={true}
      dragging={true}
      animate={true}
      easeLinearity={0.35}
      onclick={onClick}
    >
      <GeoJSON
        data={geoJSON}
        style={() => ({
          color: "#4a83ec",
          weight: 0.5,
          fillColor: "#1a1d62",
          fillOpacity: 1,
        })}
      />
      {userMarker && <Marker position={[userMarker.lat, userMarker.lng]} />}
      {cityMarker && <Marker position={[cityMarker.lat, cityMarker.lng]} />}
    </LeafletMap>
  );
};

export default Map;
