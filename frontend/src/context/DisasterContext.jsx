import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const DisasterContext = createContext(null);

export const DisasterProvider = ({ children }) => {
  const [activeDisaster, setActiveDisaster] = useState(null);
  const [isDisasterMode, setIsDisasterMode] = useState(false);
  const [disasterDetails, setDisasterDetails] = useState(null);

  const fetchStatus = async () => {
    try {
      const res = await api.getActiveDisaster();
      if (res.success && res.isActive) {
        setIsDisasterMode(true);
        setActiveDisaster(res.activeDisaster);
        setDisasterDetails(res);
      } else {
        setIsDisasterMode(false);
        setActiveDisaster(null);
        setDisasterDetails(null);
      }
    } catch (err) {
      // In case not logged in or network error, ignore gracefully
    }
  };

  useEffect(() => {
    fetchStatus();
    // Fast 2.5s polling so mode toggles propagate immediately across all department and citizen screens
    const interval = setInterval(fetchStatus, 2500);
    return () => clearInterval(interval);
  }, []);

  const triggerActivate = async (data) => {
    const res = await api.activateDisaster(data);
    if (res.success) {
      await fetchStatus();
    }
    return res;
  };

  const triggerDeactivate = async () => {
    const res = await api.deactivateDisaster(activeDisaster?._id);
    if (res.success) {
      await fetchStatus();
    }
    return res;
  };

  return (
    <DisasterContext.Provider
      value={{
        activeDisaster,
        isDisasterMode,
        disasterDetails,
        refreshDisasterStatus: fetchStatus,
        activateDisaster: triggerActivate,
        deactivateDisaster: triggerDeactivate
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => useContext(DisasterContext);
export default DisasterContext;
