import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './css/main.less';
import App from './components/App.tsx';
import { useSignalTower } from './hooks/useSignalTower.ts';

async function fetchDataAndRender() {
  try {
    const response = await fetch('/index.json');
    const data = await response.json();
    console.log( 'data:', data );

    const { appDataReceived } = useSignalTower();
    appDataReceived.dispatch( data );

    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App data={data}/>
      </StrictMode>,
    );
  } catch (error) {
    console.error('Error fetching index.json:', error);
  }
}

fetchDataAndRender();
