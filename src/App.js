import React, { useState } from "react";
import { Button, Snackbar } from "@material-ui/core";
import L from "leaflet";

import "./App.css";

import capitalCitiesList from "./capitalCities.json";

import Map from "./components/Map";
import Alert from "./components/Alert";

const INITIAL_KILOMETERS = 1500;
const CAPITAL_CITIES = capitalCitiesList.capitalCities;
const FEEDBACK_DURATION_IN_MILLIS = 1500;
const SNACKBAR_TRANSITION_DURATION = 200;

const getDistanceInKilometers = (latLng1, latLng2) => {
  let distanceInKilometers;
  try {
    distanceInKilometers = Math.round(latLng1.distanceTo(latLng2) / 1000);
  } catch (e) {
    return 0;
  }

  return distanceInKilometers;
};

const App = () => {
  const [kilometersLeft, setKilometersLeft] = useState(INITIAL_KILOMETERS);
  const [citiesPlaced, setCitiesPlaced] = useState(0);
  const [currentCity, setCurrentCity] = useState(CAPITAL_CITIES[0]);
  const [userMarker, setUserMarker] = useState(null);
  const [cityMarker, setCityMarker] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingFeedback, setIsShowingFeedback] = useState(false);

  // Every time a cityMarker is shown, subtract distance to user placed marker from app state
  React.useEffect(() => {
    if (cityMarker !== null) {
      setCitiesPlaced((prev) => prev + 1);
      const distanceInKilometers = getDistanceInKilometers(
        cityMarker,
        userMarker
      );

      if (!isUserPlacementCorrect()) {
        setKilometersLeft((prev) => Math.max(0, prev - distanceInKilometers));
      }
    }
  }, [cityMarker]);

  // Every time the kilometersLeft piece of state changes, check if game is over
  React.useEffect(() => {
    if (hasGameFinished()) {
      setIsGameOver(true);
    }
  }, [kilometersLeft]);

  // Every time citiesPlaced is updated, update currentCity
  React.useEffect(() => {
    setCurrentCity(CAPITAL_CITIES[citiesPlaced]);
  }, [citiesPlaced]);

  const startGame = () => {
    setIsPlaying(true);
  };

  const restartGame = () => {
    setIsGameOver(false);
    setCitiesPlaced(0);
    setKilometersLeft(INITIAL_KILOMETERS);
    setUserMarker(null);
    setCityMarker(null);
    startGame();
  };

  const handleMapClick = (e) => {
    if (isPlaying) {
      setUserMarker(e.latlng);
    }
  };

  const handlePinPlacement = () => {
    setCityMarker(
      L.latLng(
        CAPITAL_CITIES[citiesPlaced].lat,
        CAPITAL_CITIES[citiesPlaced].long
      )
    );
    showFeedbackAndWait();
  };

  const showFeedbackAndWait = () => {
    setIsShowingFeedback(true);

    setTimeout(() => {
      setUserMarker(null);
      setCityMarker(null);
      setIsShowingFeedback(false);
    }, FEEDBACK_DURATION_IN_MILLIS + SNACKBAR_TRANSITION_DURATION);
  };

  const isUserPlacementCorrect = () => {
    return getDistanceInKilometers(cityMarker, userMarker) < 50;
  };

  const hasGameFinished = () => {
    return citiesPlaced >= CAPITAL_CITIES.length - 1 || kilometersLeft <= 0;
  };

  const handleFeedbackClose = () => {
    setIsShowingFeedback(false);
  };

  return (
    <div className="container">
      <div className="top-controls">
        {isPlaying ? (
          <>
            <Button variant="contained" fullWidth>
              {citiesPlaced} cities placed
            </Button>
            <Button variant="contained" fullWidth>
              {kilometersLeft} kilometers left
            </Button>
            {!isGameOver ? (
              <p>Select the location of "{currentCity.capitalCity}"</p>
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={restartGame}
              >
                Restart
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={startGame}
          >
            Start
          </Button>
        )}
      </div>
      <div className="map">
        <Map
          userMarker={userMarker}
          cityMarker={cityMarker}
          onClick={handleMapClick}
        />
      </div>
      {isPlaying && !isGameOver && (
        <div className="action">
          <Button
            variant="contained"
            color="primary"
            onClick={handlePinPlacement}
          >
            Place
          </Button>
        </div>
      )}
      <Snackbar
        open={isShowingFeedback}
        autoHideDuration={FEEDBACK_DURATION_IN_MILLIS}
        onClose={handleFeedbackClose}
      >
        <Alert
          onClose={handleFeedbackClose}
          severity={isUserPlacementCorrect() ? "success" : "error"}
        >
          {isUserPlacementCorrect()
            ? "Correct"
            : `You missed by ${getDistanceInKilometers(
                userMarker,
                cityMarker
              )} kilometers`}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default App;
