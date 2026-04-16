import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-primary relative z-50">
        <div className="flex flex-col items-center gap-md">
          <Loader2 className="w-10 h-10 text-green animate-spin" />
          <p className="text-muted text-sm delay-500 animate-fade-in">Finding style...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-xl">
      <Loader2 className="w-8 h-8 text-green animate-spin" />
    </div>
  );
}
