import React, { useState, useEffect } from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import {
  Window,
  WindowHeader,
  WindowContent,
  Button,
  Toolbar,
  TextInput,
  Panel,
  Hourglass,
  styleReset,
  List,
  ListItem,
  Frame,
  Tabs,
  Tab,
  TabBody,
} from 'react95';
import original from 'react95/dist/themes/original';
import ms_sans_serif from 'react95/dist/fonts/ms_sans_serif.woff2';
import ms_sans_serif_bold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif}') format('woff2');
    font-weight: 400;
    font-style: normal
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif_bold}') format('woff2');
    font-weight: bold;
    font-style: normal
  }
  * {
    font-family: 'ms_sans_serif';
  }
  body {
    font-family: 'ms_sans_serif';
    background-color: ${original.desktopBackground};
  }
`;

const calculateTimeLeft = () => {
  const difference = new Date('2025-01-01T00:00:00-05:00').getTime() - new Date().getTime();
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const TimeCapsule = () => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch files and notes from the backend
    fetch('http://localhost:5000/files')
      .then((response) => response.json())
      .then((data) => setFiles(data))
      .catch((error) => console.error('Error fetching files:', error));

    fetch('http://localhost:5000/notes')
      .then((response) => response.json())
      .then((data) => setNotes(data.note || ''))
      .catch((error) => console.error('Error fetching notes:', error));
  }, []);

  const handleSaveFiles = () => {
    if (selectedFiles.length > 0) {
      Array.from(selectedFiles).forEach((file) => {
        const fileName = file.name;

        // Save file name to the backend
        fetch('http://localhost:5000/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: fileName }),
        })
          .then((response) => response.json())
          .then((newFile) => setFiles((prev) => [...prev, newFile]))
          .catch((error) => console.error('Error saving file:', error));
      });

      setSelectedFiles([]);
    }
  };

  const handleSaveNotes = () => {
    fetch('http://localhost:5000/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: notes }),
    }).catch((error) => console.error('Error saving notes:', error));
  };

  return (
    <ThemeProvider theme={original}>
      <GlobalStyles />
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <Window style={{ width: '600px' }}>
          <WindowHeader style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>Time_Capsule.exe - 2024</span>
          </WindowHeader>

          <Toolbar>
            <Button variant="menu" size="sm">
              File
            </Button>
            <Button variant="menu" size="sm">
              Edit
            </Button>
            <Button variant="menu" size="sm">
              Help
            </Button>
          </Toolbar>

          <WindowContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Panel variant="well" style={{ width: '100%', marginBottom: '1rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '1rem',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{String(value).padStart(2, '0')}</div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase' }}>{unit}</div>
                  </div>
                ))}
              </div>
            </Panel>

            <Tabs value={activeTab} onChange={setActiveTab} style={{ width: '100%' }}>
              <Tab value={0}>Files</Tab>
              <Tab value={1}>Notes</Tab>
            </Tabs>

            <TabBody style={{ width: '100%', marginTop: '1rem' }}>
              {activeTab === 0 && (
                <div>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    style={{ marginBottom: '1rem' }}
                  />
                  <Button
                    onClick={handleSaveFiles}
                    disabled={selectedFiles.length === 0}
                    style={{ marginBottom: '1rem', width: '100%' }}
                  >
                    Save Selected Files
                  </Button>
                  <Frame
                    variant="field"
                    style={{
                      width: '100%',
                      height: '250px',
                      padding: '0.5rem',
                      backgroundColor: 'white',
                      overflow: 'auto',
                    }}
                  >
                    {files.length === 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          color: '#666',
                        }}
                      >
                        <Hourglass size={32} />
                        <p style={{ marginTop: '0.5rem' }}>No files saved yet...</p>
                      </div>
                    ) : (
                      <List style={{ width: '100%' }}>
                        {files.map((file, index) => (
                          <ListItem
                            key={index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'default',
                            }}
                          >
                            <span>{file.name}</span>
                            <span style={{ fontSize: '12px', color: '#666' }}>{file.timestamp}</span>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Frame>
                </div>
              )}

              {activeTab === 1 && (
                <div>
                  <TextInput
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    multiline
                    rows={10}
                    placeholder="Write your notes here..."
                    style={{ marginBottom: '1rem', width: '100%' }}
                  />
                  <Button onClick={handleSaveNotes} style={{ width: '100%' }}>
                    Save Notes
                  </Button>
                </div>
              )}
            </TabBody>
          </WindowContent>
        </Window>
      </div>
    </ThemeProvider>
  );
};

export default TimeCapsule;