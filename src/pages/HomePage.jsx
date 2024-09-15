import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchGeoInfo, fetchHistory } from "../features/geo/geoSlice";
import { logout } from "../features/auth/authSlice";
import axios from "axios";
import axiosInstance from "../utils/axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const HomePage = () => {
  const [ip, setIp] = useState("");
  const [selectedIpDetails, setSelectedIpDetails] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const geo = useSelector((state) => state.geo);
  const auth = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleSearch = () => {
    dispatch(fetchGeoInfo(ip));
  };
  const handleDelete = async () => {
    try {
      let token = auth.token;
      if (!token) {
        token = await refreshToken();
        dispatch(updateToken(token));
        state = getState();
        token = state.auth.token;
      }
      const response = await axiosInstance.delete("/geo/history", {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids: selectedIds },
      });

      dispatch(fetchHistory(1));
      setSelectedIds([]);
    } catch (error) {
      console.error("Error deleting history items:", error);
    }
  };

  const handleShowDetails = (ipDetails) => {
    setSelectedIpDetails(ipDetails);
  };

  const handleCloseModal = () => {
    setSelectedIpDetails(null);
  };

  const handleSelect = (id) => {
    setSelectedIds((prevSelectedIds) =>
      prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((selectedId) => selectedId !== id)
        : [...prevSelectedIds, id]
    );
  };

  useEffect(() => {
    dispatch(fetchHistory(1));
  }, []);

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await axios.get("https://api.ipify.org?format=json");
        if (response.data.ip) {
          setIp(response.data.ip);
          dispatch(fetchGeoInfo(response.data.ip));
        }
      } catch (error) {
        console.error("Error fetching IP address:", error);
      }
    };

    fetchIp();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Home</h2>
          <button
            onClick={handleLogout}
            className="bg-blue-600 text-white p-2 rounded"
          >
            Logout
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="Enter IP Address"
            className="border p-2 rounded mr-2"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Search
          </button>
        </div>
        {geo.status === "loading" && (
          <p className="text-yellow-500">Loading...</p>
        )}
        {geo.status === "succeeded" && geo.geoInfo && (
          <div className="bg-gray-100 p-4 rounded mb-4 flex">
            <div className="w-1/4">
              <p>
                <strong>IP:</strong> {geo.geoInfo.geo_info.ip}
              </p>
              <p>
                <strong>City:</strong> {geo.geoInfo.geo_info.city}
              </p>
              <p>
                <strong>Region:</strong> {geo.geoInfo.geo_info.region}
              </p>
              <p>
                <strong>Country:</strong> {geo.geoInfo.geo_info.country}
              </p>
              <p>
                <strong>Location:</strong> {geo.geoInfo.geo_info.loc}
              </p>
              <p>
                <strong>Org:</strong> {geo.geoInfo.geo_info.org}
              </p>
              <p>
                <strong>Postal:</strong> {geo.geoInfo.geo_info.postal}
              </p>
              <p>
                <strong>Timezone:</strong> {geo.geoInfo.geo_info.timezone}
              </p>
            </div>
            {geo.geoInfo.geo_info.loc && (
              <div className="w-3/4">
                <MapContainer
                  center={geo.geoInfo.geo_info.loc.split(",").map(Number)}
                  zoom={13}
                  style={{ height: "300px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={geo.geoInfo.geo_info.loc.split(",").map(Number)}
                  >
                    <Popup>
                      {geo.geoInfo.geo_info.city}, {geo.geoInfo.geo_info.region}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>
        )}
        {geo.status === "failed" && <p className="text-red-500">{geo.error}</p>}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Search History</h3>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white p-1 rounded"
          >
            Delete
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          <ul className="list-disc pl-5">
            {geo.history.map((item) => (
              <li key={item.id} className="mb-2 flex items-center">
                <input
                  type="checkbox"
                  id={`history-${item.id}`}
                  className="mr-2"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleSelect(item.id)}
                />
                <label
                  htmlFor={`history-${item.id}`}
                  className="cursor-pointer ml-1"
                  onClick={() => handleShowDetails(item)}
                >
                  {item.ip_address}
                </label>
              </li>
            ))}
          </ul>
        </div>
        {selectedIpDetails && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">IP Details</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 rounded"
                >
                  X
                </button>
              </div>
              <p>
                <strong>IP:</strong> {selectedIpDetails.geo_info.ip}
              </p>
              <p>
                <strong>City:</strong> {selectedIpDetails.geo_info.city}
              </p>
              <p>
                <strong>Region:</strong> {selectedIpDetails.geo_info.region}
              </p>
              <p>
                <strong>Country:</strong> {selectedIpDetails.geo_info.country}
              </p>
              <p>
                <strong>Location:</strong> {selectedIpDetails.geo_info.loc}
              </p>
              <p>
                <strong>Org:</strong> {selectedIpDetails.geo_info.org}
              </p>
              <p>
                <strong>Postal:</strong> {selectedIpDetails.geo_info.postal}
              </p>
              <p>
                <strong>Timezone:</strong> {selectedIpDetails.geo_info.timezone}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
