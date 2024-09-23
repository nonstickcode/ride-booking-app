import BookingForm from '@/components/BookingForm';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4">
      <header className="text-5xl font-semibold text-gray-500">
        <h1>#RYDEBLK</h1>
      </header>

      <main className="mt-2 flex flex-col items-center space-y-6">
        <p className="text-lg font-semibold text-gray-500">With Jamie</p>

        {/* Image with fixed width and height */}
        <Image
          className="rounded-lg"
          src="/images/escalade.jpg"
          width={256}
          height={256}
          alt="escalade"
        />

        {/* BookingForm component with the same width as the image */}
        <BookingForm />
      </main>

      <footer className="mt-8 flex items-center justify-center space-x-4">
        {/* Footer content can go here */}
      </footer>
    </div>
  );
}
