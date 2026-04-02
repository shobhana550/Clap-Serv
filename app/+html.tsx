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

        {/* GA4 + Google Ads */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-5V51025B3V" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-5V51025B3V');
          gtag('config', 'AW-581763427');
        `}} />

        {/* PostHog Web */}
        <script dangerouslySetInnerHTML={{ __html: `
          !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
          posthog.init('phc_zaYSSE5mWmf6tEMBtcMk4rBP6WYozTqCwYsp6oiifLZa', {api_host: 'https://eu.i.posthog.com', person_profiles: 'identified_only'});
        `}} />

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
