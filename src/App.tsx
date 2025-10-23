import { GeoTable } from "./components/GeoTable/GeoTable";
import { GeoInput } from "./components/InputArea/GeoInput";
import { useGeoParser } from "./hooks/useGeoParcer";
import './App.css'
import { UpdateNotification } from "./components/UpdateNotification/UpdateNotification";

function App() {
  const {
    urlGroups,
    geoInput,
    urlInput,
    setGeoInput,
    setUrlInput,
    parse,
    toggleCheck,
    updateNote,
    deleteUrlGroup,
    clearAll,
    exportData
  } = useGeoParser();

  return (
    <div className="app">
      <UpdateNotification />

      <header className="app-header">
        <div className="header-content">
          <h1>Kaspersky Locales</h1>
          <p className="header-subtitle">Работа с локалями</p>
        </div>
      </header>

      <main className="app-main">
        <GeoInput
          geoInput={geoInput}
          urlInput={urlInput}
          onGeoInputChange={setGeoInput}
          onUrlInputChange={setUrlInput}
          onParse={parse}
          onClear={clearAll}
        />

        <GeoTable
          urlGroups={urlGroups}
          onToggleCheck={toggleCheck}
          onUpdateNote={updateNote}
          onDeleteGroup={deleteUrlGroup}
          onExport={exportData}
        />
      </main>
    </div>
  );
}

export default App;
