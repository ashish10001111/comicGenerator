// App.js

import React, { useState } from 'react';
import './App.css';
import Loader from './Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const API_URL = "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [comicPanels, setComicPanels] = useState(Array.from({ length: 10 }, () => ({ text: '', annotation: '' })));
  const [comicImages, setComicImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(true);

  const handleInputChange = (index, type, value) => {
    const newComicPanels = [...comicPanels];
    newComicPanels[index][type] = value;
    setComicPanels(newComicPanels);
  };

  const generateComic = async () => {
    try {
      setLoading(true);

      const imageDataArray = await Promise.all(comicPanels.map(async (panel, index) => {
        const panelTextValue = panel.text.trim();
        const panelAnnotationValue = panel.annotation.trim();

        if (panelTextValue !== '') {
          const data = { "inputs": `${panelTextValue}\n\n${panelAnnotationValue}` };
          const response = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Accept": "image/png",
              "Authorization": "Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM",
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }

          const imageData = await response.blob();
          return { image: imageData, annotation: panelAnnotationValue };
        }
        return null; // Return null for panels with empty text
      }));

      setComicImages(imageDataArray.filter(Boolean)); // Filter out null values
      setError('');
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Error generating comic. Please try again.');
    } finally {
      setLoading(false);
      setShowForm(false); // Hide the form after generating images
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const resetForm = () => {
    setComicImages([]);
    setError('');
    setShowForm(true); // Show the form again
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="dark-mode-toggle" onClick={toggleDarkMode}>
        <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
      </div>
      <h1>Comic Strip Generator</h1>
      {showForm && (
        <>
      <div className="comic-panels">
        {comicPanels.map((panel, index) => (
          // <div className="formm">
          <div key={index} className="comic-pane">
            <input
              value={panel.text}
              onChange={(e) => handleInputChange(index, 'text', e.target.value)}
              placeholder="Enter text for panel"
            />
            <input
              type="text"
              value={panel.annotation}
              onChange={(e) => handleInputChange(index, 'annotation', e.target.value)}
              placeholder="Speech Bubble or Annotation"
            />
          </div>
       
        ))}
      </div>
      <button onClick={generateComic}>Generate Comic</button>
      {loading && <Loader />}
      {error && <div className="error">{error}</div>}
      </>
      )}
        {!showForm && (
        <>
          <button onClick={resetForm}>Go Back to Form</button>
      <div className="comic-strip">
        {comicImages.map((panel, index) => (
          <div key={index} className="comic-panel">
            <div className="speech-bubble">
              {panel.annotation}
            </div>
            <img src={URL.createObjectURL(panel.image)} alt={`Comic Panel ${index + 1}`} />
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}

export default App;