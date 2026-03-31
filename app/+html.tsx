import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* SEO */}
        <title>Clap-Serv — Your Neighbourhood, Your Services</title>
        <meta name="description" content="Post a service request, receive competing proposals from verified local providers, negotiate directly. Zero commission, zero subscription — forever." />
        <meta name="keywords" content="local services, plumber, electrician, carpenter, painter, India, zero commission, service marketplace, community" />
        <link rel="canonical" href="https://app.clap-serv.com" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Clap-Serv" />
        <meta property="og:title" content="Clap-Serv — Your Neighbourhood, Your Services" />
        <meta property="og:description" content="Post a service request, receive competing proposals from verified local providers, negotiate directly. Zero commission — forever." />
        <meta property="og:image" content="https://www.clap-serv.com/images/logo_svg.png" />
        <meta property="og:url" content="https://app.clap-serv.com" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ClapServ" />
        <meta name="twitter:title" content="Clap-Serv — Your Neighbourhood, Your Services" />
        <meta name="twitter:description" content="Post a service request, receive competing proposals from verified local providers. Zero commission — forever." />
        <meta name="twitter:image" content="https://www.clap-serv.com/images/logo_svg.png" />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Clap-Serv",
            "url": "https://app.clap-serv.com",
            "description": "India's community marketplace connecting buyers with skilled local service providers — zero commission, zero subscription.",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web, Android",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
            "publisher": {
              "@type": "Organization",
              "name": "Clap-Serv",
              "url": "https://www.clap-serv.com"
            }
          })}}
        />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
