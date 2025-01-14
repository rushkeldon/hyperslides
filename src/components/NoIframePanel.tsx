import '../css/noIframePanel.less';

export default function NoIframePanel({ url }) {
  return <div className="no-iframe-panel">
    <p>This url does not allow itself in an iframe - click to open in a new tab.</p>
    <a
      className="iframe-link"
      target="_blank"
      href={url}
    >
      {url}
    </a>
  </div>;
}
