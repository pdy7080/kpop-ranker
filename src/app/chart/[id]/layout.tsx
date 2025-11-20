// Server component to provide generateStaticParams for static export
export async function generateStaticParams() {
  // Return all chart IDs for static generation
  // Note: client components will be hydrated on the client side
  return [
    { id: 'melon' },
    { id: 'genie' },
    { id: 'bugs' },
    { id: 'flo' },
    { id: 'circle' },
    { id: 'lastfm' },
    { id: 'spotify' },
    { id: 'apple' },
    { id: 'youtube' },
    { id: 'vibe' },
  ];
}

// Allow params not in generateStaticParams
export const dynamicParams = true;

export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
