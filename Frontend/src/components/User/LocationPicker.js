import React, { useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import PlacesAutocomplete, { geocodeByPlaceId } from 'react-google-places-autocomplete';
import axios from 'axios';
import toast from 'react-hot-toast';

const darkModeColors = {
  background: "#18283e",
  text: "#e0e0e0",
  border: "#fff",
  icon: "#fff",
};

const lightModeColors = {
  background: "#f8f9fa",
  text: "#000",
  border: "#000",
  icon: "#000",
};


const LocationPicker = ({ darkMode, apiBaseUrl }) => {
  const apiKey = 'AIzaSyATwAQvAmj3kqExYa5-SVUAnkIEZlHxR-c';  // You can also pass this as a prop if needed
  const mapStyles = { height: '80vh', width: '100%' };
  const currentColors = darkMode ? lightModeColors : lightModeColors;


  const defaultCenter = { lat: 22.958746, lng: 72.472967 };
  const [center, setCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [error, setError] = useState('');

  // Handle place selection from the autocomplete input
  const handlePlaceSelect = async (place) => {
    setSelectedPlace(place);

    try {
      const results = await geocodeByPlaceId(place.value.place_id);
      const location = results[0].geometry.location;
      const lat = location.lat();
      const lng = location.lng();

      setCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
      setError('');
    } catch (err) {
      console.error('Error fetching location:', err); // Log the error for debugging
      setError('Failed to fetch location details.');
    }
  };

  // Handle "Done" button click
  const handleDoneClick = async () => {
    if (!selectedPlace || !selectedPlace.label) {
      toast.error("Please enter a location in the input.");
      return;
    }
  
    const locationData = {
      email: localStorage.getItem("Email"), // Replace this with dynamic email retrieval if needed
      latitude: markerPosition.lat,
      longitude: markerPosition.lng,
      delivery_address: selectedPlace.label, // Use the selected address
    };
  
    try {
      const response = await axios.patch(
        `${apiBaseUrl}/user/longlat`,
        locationData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
  
      if (response.status === 200) {
        toast.success("Location updated successfully:");
      } else {
        console.error("Failed to update location.");
        setError("Failed to update location.");
      }
    } catch (error) {
      console.error("Error updating location:", error);
      setError("Failed to update location.");
    }
  };
  



  return (
    <div className="w-full h-screen flex flex-col" style={{ backgroundColor: currentColors.background, color: currentColors.text }}>
      {/* Address Input */}
      <div className="p-4 bg-white shadow-md flex items-center justify-center">
        <div className="flex items-center w-full max-w-lg relative">
          <PlacesAutocomplete
            apiKey={apiKey}
            selectProps={{
              placeholder: 'Search for an address...',
              onChange: handlePlaceSelect,
              value: selectedPlace,
            }}
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Map Section */}
      <div className="flex-grow">
        <GoogleMap
          mapContainerStyle={mapStyles}
          zoom={14}
          center={center}
          onClick={(e) =>
            setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() })
          }
        >
          <Marker
            position={markerPosition}
            draggable
            onDragEnd={(e) =>
              setMarkerPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            }
          />
        </GoogleMap>
      </div>

      {/* Done Button */}
      <div className="p-4 bg-white shadow-md flex justify-center">
        <button
          onClick={handleDoneClick}
          className="btn btn-success"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;
