import BookingForm from "@/components/BookingForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="text-8xl font-semibold text-gray-500">
        <h1>
          #RYDEBLK
        </h1>
      </header>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <BookingForm />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
