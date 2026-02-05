import Image from "next/image";
import TestimonialsAvatars from "./TestimonialsAvatars";
import config from "@/config";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-gradient-to-br from-base-100 via-primary/5 to-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Automatisez vos messages WhatsApp
          </span>{" "}
          pour vos webinaires
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          Engagez vos participants avant, pendant et après vos webinaires avec des messages WhatsApp personnalisés et automatisés. Boostez votre taux de participation et fidélisez votre audience.
        </p>
        <button className="btn btn-primary btn-wide h-[60px] shadow-lg hover:shadow-xl transition-shadow">
          Commencer l'automatisation WhatsApp
        </button>

        <TestimonialsAvatars priority={true} />
      </div>
      <div className="lg:w-full">
        <Image
          src="/home/pingrelay-whatsapp-webinar-automation-hero.png"
          alt="Automatisez vos messages WhatsApp avant, pendant et après vos webinars avec Pingrelay"
          className="w-full rounded-md"
          priority={true}
          width={500}
          height={500}
        />
      </div>
    </section>
  );
};

export default Hero;
