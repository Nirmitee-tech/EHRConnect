export default function PatientLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No authenticated layout - just render children directly
  return children
}
