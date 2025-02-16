import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './css/main.less';
import App from './components/App.tsx';
import { useSignalTower } from './hooks/useSignalTower.ts';

function isValidHttpsUrl(url: string): boolean {
  const regex = /^https:\/\/[^\s/$.?#].[^\s]*$/i;
  return regex.test(url);
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const json = params.get('json') || '/index.json';
  return { json };
}

function setFavicon(url: string) {
  let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");

  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  link.href = url;
}

async function fetchDataAndRender() {
  const { json } = getQueryParams();

  const dataURL = isValidHttpsUrl(json) ? json : '/index.json';

  try {
    const response = await fetch( dataURL );
    const data = await response.json();

    if( data.title ) document.title = data.title;
    data.icon && setFavicon( data.icon );
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
