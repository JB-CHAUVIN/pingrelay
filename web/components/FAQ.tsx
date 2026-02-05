"use client";

import { useRef, useState } from "react";
import type { JSX } from "react";

// <FAQ> component is a lsit of <Item> component
// Just import the FAQ & add your FAQ content to the const faqList arrayy below.

interface FAQItemProps {
  question: string;
  answer: JSX.Element;
}

const faqList: FAQItemProps[] = [
  {
    question: "Comment fonctionne PingRelay ?",
    answer: (
      <div className="space-y-2 leading-relaxed">
        PingRelay envoie automatiquement des messages WhatsApp personnalisés à
        vos participants avant, pendant et après vos webinaires. Vous programmez
        vos messages une seule fois (rappels, accès, replay…), et PingRelay
        s’occupe de l’envoi au bon moment.
      </div>
    ),
  },
  {
    question: "Puis-je personnaliser les messages automatiques ?",
    answer: (
      <p>
        Absolument. Vous pouvez créer vos propres modèles de messages avec des
        variables personnalisées (prénom, date du webinaire, lien d’accès,
        replay, etc.). Les variables sont automatiquement remplacées pour chaque
        participant.
      </p>
    ),
  },
  {
    question: "Est-ce conforme aux règles WhatsApp ?",
    answer: (
      <p>
        Les messages sont envoyés via une technologie s’appuyant sur WhatsApp
        Web. Des règles de sécurité et de bonnes pratiques sont appliquées afin
        de réduire au maximum les risques de restriction ou de bannissement.
      </p>
    ),
  },
  {
    question: "Les participants doivent-ils avoir donné leur accord ?",
    answer: (
      <p>
        Oui. PingRelay est conçu pour être utilisé uniquement avec des contacts
        ayant explicitement accepté de recevoir vos messages (inscription à un
        webinaire, opt-in, relation existante).
      </p>
    ),
  },
  {
    question: "Combien de messages puis-je envoyer ?",
    answer: (
      <p>
        Le volume d’envoi dépend de votre utilisation et du plan choisi. Des
        limites intelligentes sont appliquées afin de préserver la sécurité de
        votre compte WhatsApp.
      </p>
    ),
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: (
      <p>
        Oui. Les données sont utilisées uniquement pour l’envoi des messages et
        ne sont jamais revendues. Nous appliquons des mesures de sécurité pour
        protéger vos informations et celles de vos participants.
      </p>
    ),
  },
  {
    question: "Puis-je arrêter l’automatisation à tout moment ?",
    answer: (
      <p>
        Bien sûr. Vous pouvez activer, désactiver ou modifier vos campagnes à
        tout moment depuis votre tableau de bord.
      </p>
    ),
  },
  {
    question: "Puis-je obtenir un remboursement ?",
    answer: (
      <p>
        Oui. Vous pouvez demander un remboursement dans les 7 jours suivant
        votre achat. Il suffit de nous contacter par email et nous traiterons
        votre demande rapidement.
      </p>
    ),
  },
  {
    question: "J'ai une autre question",
    answer: (
      <div className="space-y-2 leading-relaxed">
        Pas de souci. Contactez-nous par email à l’adresse indiquée en bas de
        page, nous serons ravis de vous aider.
      </div>
    ),
  },
];

const FaqItem = ({ item }: { item: FAQItemProps }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/10"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
        >
          {item?.question}
        </span>
        <svg
          className={`flex-shrink-0 w-4 h-4 ml-auto fill-current`}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center transition duration-200 ease-out ${
              isOpen && "rotate-180"
            }`}
          />
          <rect
            y="7"
            width="16"
            height="2"
            rx="1"
            className={`transform origin-center rotate-90 transition duration-200 ease-out ${
              isOpen && "rotate-180 hidden"
            }`}
          />
        </svg>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{item?.answer}</div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-base-200" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            Questions Fréquentes
          </p>
        </div>

        <ul className="basis-1/2">
          {faqList.map((item, i) => (
            <FaqItem key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
