// Server component to provide generateStaticParams for static export
export async function generateStaticParams() {
  // Provide one dummy track to satisfy static export requirement
  // Other tracks will be handled client-side
  return [
    {
      artist: 'example',
      title: 'example'
    }
  ];
}

// Allow dynamic params - will render on client side
export const dynamicParams = true;

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
