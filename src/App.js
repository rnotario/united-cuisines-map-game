import React, { useState } from "react";
import { Button, Snackbar, Paper } from "@material-ui/core";
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
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [userMarker, setUserMarker] = useState(null);
  const [cityMarker, setCityMarker] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingFeedback, setIsShowingFeedback] = useState(false);

  // Every time a cityMarker is shown, subtract distance to user placed marker from app state
  React.useEffect(() => {
    if (cityMarker !== null) {
      const distanceInKilometers = getDistanceInKilometers(
        cityMarker,
        userMarker
      );

      if (!isUserPlacementCorrect()) {
        setKilometersLeft((prev) => Math.max(0, prev - distanceInKilometers));
      } else {
        setCitiesPlaced((prev) => prev + 1);
      }
    }
  }, [cityMarker]);

  // Every time the kilometersLeft piece of state changes, check if game is over
  React.useEffect(() => {
    if (hasGameFinished()) {
      setIsGameOver(true);
    }
  }, [kilometersLeft]);

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
        CAPITAL_CITIES[currentCityIndex].lat,
        CAPITAL_CITIES[currentCityIndex].long
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
      setCurrentCityIndex((prev) => prev + 1);
    }, FEEDBACK_DURATION_IN_MILLIS + SNACKBAR_TRANSITION_DURATION);
  };

  const isUserPlacementCorrect = () => {
    return getDistanceInKilometers(cityMarker, userMarker) < 50;
  };

  const hasGameFinished = () => {
    return currentCityIndex >= CAPITAL_CITIES.length - 1 || kilometersLeft <= 0;
  };

  const handleFeedbackClose = () => {
    setIsShowingFeedback(false);
  };

  const renderBottomControls = () => {
    return (
      isPlaying &&
      !isGameOver && (
        <Button
          variant="contained"
          color="primary"
          onClick={handlePinPlacement}
          disabled={!userMarker}
        >
          Place
        </Button>
      )
    );
  };

  const renderTopControls = () => {
    return isPlaying ? (
      <>
        <Paper
          style={{
            backgroundColor: "lightgray",
            padding: "10px",
            marginBottom: "5px",
          }}
        >
          {citiesPlaced} cities placed
        </Paper>
        <Paper
          style={{
            backgroundColor: "lightgray",
            padding: "10px",
            marginBottom: "5px",
          }}
        >
          {kilometersLeft} kilometers left
        </Paper>
        {!isGameOver ? (
          <p>
            Select the location of "
            {CAPITAL_CITIES[currentCityIndex].capitalCity}"
          </p>
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
    );
  };

  return (
    <div className="container">
      <div className="top-controls">{renderTopControls()}</div>
      <div className="map">
        <Map
          userMarker={userMarker}
          cityMarker={cityMarker}
          onClick={handleMapClick}
        />
      </div>
      <div className="bottom-controls">{renderBottomControls()}</div>
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
