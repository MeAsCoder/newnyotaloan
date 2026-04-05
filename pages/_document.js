import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="theme-color" content="#1B4332" />
        <link rel="icon" href="/favcon.png" type="image/png" />
        <meta name="description" content="NyotaFund – Kenya's trusted M-Pesa digital lender. Get instant loans from KES 3,000 to KES 500,000." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
