export async function checkIframeAllowed(url: string): Promise<boolean> {
  try {
    // Attempt to fetch headers via HEAD
    let response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    let cspHeader = response.headers.get('content-security-policy');
    let xFrameOptions = response.headers.get('x-frame-options');

    // Check headers from HEAD response
    if (xFrameOptions && ['deny', 'sameorigin'].includes(xFrameOptions.toLowerCase())) {
      return false;
    }
    if (cspHeader && cspHeader.includes('frame-ancestors')) {
      return false;
    }

    // Retry with GET if necessary
    if (!xFrameOptions && !cspHeader) {
      console.log('attempting GET...');
      response = await fetch(url, { method: 'GET', redirect: 'follow' });
      cspHeader = response.headers.get('content-security-policy');
      xFrameOptions = response.headers.get('x-frame-options');

      if (xFrameOptions && ['deny', 'sameorigin' ].includes(xFrameOptions.toLowerCase())) {
        return false;
      }
      if (cspHeader && cspHeader.includes('frame-ancestors')) {
        return false;
      }
    }

    return true; // Default to allowed if no headers found
  } catch (error) {
    console.error('Error checking iframe compatibility:', error);
    return false; // Default to not allowed on error
  }
}
