import React, { useState } from "react";
import './App.css';
import Webcam from "react-webcam";

const customVisionEndpoint = 'https://autorecycler-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/0ec06c2a-86c7-4ea9-8459-5388cbd0c0d3/classify/iterations/RecylingDetection/image';

const wasteMapping = {
  'cardboard': 'Paper',
  'paper': 'Paper',
  'plastic': 'Plastic',
  'trash': 'Trash',
  'metal': 'Metal',
  'glass': 'Glass'
};

const base64toBlob = (dataURL) => {
  var parts = dataURL.split(';base64,');
  var contentType = parts[0].split(':')[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;
  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  var imgContent = new Blob([uInt8Array], { type: contentType });

  return imgContent;
}

function App() {
  const [imageSrc, setImageSrc] = useState("");
  const [classification, setClassification] = useState("");

  const webcamRef = React.useRef(null);

  const capture = React.useCallback(
    async () => {
      const imageSrc = webcamRef.current.getScreenshot();
      setImageSrc(imageSrc);

      const imageBlob = base64toBlob(imageSrc);

      const res = await fetch(customVisionEndpoint,
        {
          method: 'POST',
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/octet-stream', "Prediction-Key": "1db1de80db074731b966bca3b5a334ef" },
          body: imageBlob
        });

      const prediction = (await res.json()).predictions[0];
      setClassification(`${wasteMapping[prediction.tagName]} (${(prediction.probability * 100).toFixed(1)}%)`)
    },
    [webcamRef]
  );

  return (
    <div className="App">
      <h1 className="page-title">AutoRecycler</h1>
      <h4 className="page-subtitle">Recycling Made Easy!</h4>
      <Webcam
        className="webcam"
        audio={false}
        width={"45%"}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
      />
      <button onClick={capture}>Recycle!</button>
      <h1 className="prediction">{classification}</h1>
    </div>
  );
}

export default App;
