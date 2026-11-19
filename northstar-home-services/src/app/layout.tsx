import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'NORTHSTAR Home Services | Austin, TX', description: 'Thoughtful home services in Austin, Texas. Request a free estimate for remodeling, plumbing, electrical, roofing, HVAC and cleaning.', metadataBase: new URL('https://northstar-demo.example') };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
