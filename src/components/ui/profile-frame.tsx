import Image from "next/image";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

interface ProfileFrameProps {
  imageSrc: string;
  imageAlt: string;
  name: string;
  label: string;
}

export default function ProfileFrame({
  imageSrc,
  imageAlt,
  name,
  label,
}: ProfileFrameProps) {
  return (
    <div className="relative flex w-full max-w-[300px] sm:max-w-[370px] md:max-w-[400px] flex-col items-start">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full rounded-3xl bg-[#D4AF37] p-3 md:p-4 shadow-xl shadow-black/40"
      >
        <div className="mb-3 md:mb-3.5 flex items-center justify-between">
          <span className="font-display text-sm md:text-base font-bold tracking-wide text-black">
            {label}
          </span>
          <Menu aria-hidden="true" className="h-4 w-4 md:h-5 md:w-5 text-black" />
        </div>
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 640px) 280px, 400px"
            className="object-cover"
          />
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 font-display text-lg md:text-xl text-foreground"
      >
        {name}
      </motion.p>
    </div>
  );
}