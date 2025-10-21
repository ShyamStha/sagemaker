import React, { useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  // Feature options
  const workclassOptions = [4, 6];
  const maritalStatusOptions = [2, 4, 6];
  const occupationOptions = [3, 4, 5, 6, 7, 8, 10, 12, 14];
  const relationshipOptions = [0, 1, 2, 3, 4, 5];
  const raceOptions = [0, 1, 2, 3, 4];
  const sexOptions = [0, 1];
  const countryOptions = [39];

  // State
  const [features, setFeatures] = useState({
    Age: 30,
    Workclass: 4,
    EducationNum: 10,
    MaritalStatus: 2,
    Occupation: 5,
    Relationship: 1,
    Race: 4,
    Sex: 0,
    CapitalGain: 0,
    CapitalLoss: 0,
    HoursPerWeek: 40,
    Country: 39
  });

  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  // Handle changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeatures({ ...features, [name]: Number(value) });
  };

  // Submit to Flask API
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        features: [Object.values(features)]
      });
      setPrediction(response.data.predictions[0]);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setPrediction(null);
    }
  };

  // Chart data
  const chartData = {
    labels: ["<=50K", ">50K"],
    datasets: [
      {
        label: "Prediction Probability",
        data: prediction !== null ? [1 - prediction, prediction] : [0, 0],
        backgroundColor: ["#3498db", "#e74c3c"]
      }
    ]
  };

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto", fontFamily: "Arial" }}>
      <h2>XGBoost Income Prediction</h2>
      <form onSubmit={handleSubmit}>
        {/* Sliders for numeric features */}
        {[
          { key: "Age", min: 17, max: 90 },
          { key: "EducationNum", min: 1, max: 16 },
          { key: "CapitalGain", min: 0, max: 50000 },
          { key: "CapitalLoss", min: 0, max: 5000 },
          { key: "HoursPerWeek", min: 1, max: 100 }
        ].map(({ key, min, max }) => (
          <div key={key} style={{ marginBottom: "20px" }}>
            <label>{key}: {features[key]}</label>
            <input
              type="range"
              name={key}
              min={min}
              max={max}
              value={features[key]}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
          </div>
        ))}

        {/* Dropdowns */}
        {[
          { key: "Workclass", options: workclassOptions },
          { key: "MaritalStatus", options: maritalStatusOptions },
          { key: "Occupation", options: occupationOptions },
          { key: "Relationship", options: relationshipOptions },
          { key: "Race", options: raceOptions },
          { key: "Sex", options: sexOptions },
          { key: "Country", options: countryOptions }
        ].map(({ key, options }) => (
          <div key={key} style={{ marginBottom: "15px" }}>
            <label>{key}: </label>
            <select name={key} value={features[key]} onChange={handleChange}>
              {options.map((val) => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        ))}

        <button type="submit" style={{ padding: "10px 20px", marginTop: "10px" }}>
          Predict
        </button>
      </form>

      {/* Prediction Chart */}
      {prediction !== null && (
        <div style={{ marginTop: "30px" }}>
          <h3>Prediction Confidence</h3>
          <Bar data={chartData} options={{ indexAxis: 'y', responsive: true }} />
          <p style={{ marginTop: "10px", fontSize: "16px" }}>
            Predicted Probability of >50K: {prediction.toFixed(3)}
          </p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

export default App;