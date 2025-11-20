// Server component to provide generateStaticParams for [artist] segment
export async function generateStaticParams() {
  // Provide one dummy artist to satisfy static export requirement
  // Other artists will be handled client-side
  return [
    { artist: 'example' }
  ];
}

// Allow dynamic params - will render on client side
export const dynamicParams = true;

export default function ArtistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
