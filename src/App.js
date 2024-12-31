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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [filesResponse, notesResponse] = await Promise.all([
          fetch('/api/files'),
          fetch('/api/notes')
        ]);

        if (!filesResponse.ok || !notesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const filesData = await filesResponse.json();
        const notesData = await notesResponse.json();

        setFiles(filesData);
        setNotes(notesData.note || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveFiles = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    try {
      // Create an array of file names from the selected files
      const fileNames = Array.from(selectedFiles).map(file => ({
        name: file.name,
        timestamp: new Date().toISOString()
      }));

      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileNames),
      });

      if (!response.ok) throw new Error('Failed to save files');

      const savedFiles = await response.json();
      setFiles(prev => [...prev, ...savedFiles]);
      setSelectedFiles([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: notes }),
      });

      if (!response.ok) throw new Error('Failed to save notes');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
            <Button variant="menu" size="sm">File</Button>
            <Button variant="menu" size="sm">Edit</Button>
            <Button variant="menu" size="sm">Help</Button>
          </Toolbar>

          <WindowContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Panel variant="well" style={{ width: '100%', marginBottom: '1rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                padding: '1rem',
                textAlign: 'center',
              }}>
                {Object.entries(timeLeft).map(([unit, value]) => (
                  <div key={unit}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {String(value).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase' }}>
                      {unit}
                    </div>
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
                    disabled={selectedFiles.length === 0 || isLoading}
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
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#666',
                      }}>
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
                            <span style={{ fontSize: '12px', color: '#666' }}>
                              {new Date(file.timestamp).toLocaleString()}
                            </span>
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
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSaveNotes} 
                    style={{ width: '100%' }}
                    disabled={isLoading}
                  >
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